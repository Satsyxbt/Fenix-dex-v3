import {
  abi as FACTORY_ABI,
  bytecode as FACTORY_BYTECODE,
} from '@cryptoalgebra/integral-core/artifacts/contracts/AlgebraFactoryUpgradeable.sol/AlgebraFactoryUpgradeable.json';
import {
  abi as PROXY_ADMIN_ABI,
  bytecode as PROXY_ADMIN_BYTECODE,
} from '@cryptoalgebra/integral-core/artifacts/@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json';
import {
  abi as TransparentUpgradeableProxy_ABI,
  bytecode as TransparentUpgradeableProxy_BYTECODE,
} from '@cryptoalgebra/integral-core/artifacts/@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json';

import {
  abi as TEST_CALLEE_ABI,
  bytecode as TEST_CALLEE_BYTECODE,
} from '@cryptoalgebra/integral-core/artifacts/contracts/test/TestAlgebraCallee.sol/TestAlgebraCallee.json';
import {
  abi as POOL_DEPLOYER_ABI,
  bytecode as POOL_DEPLOYER_BYTECODE,
} from '@cryptoalgebra/integral-core/artifacts/contracts/test/MockTimeAlgebraPoolDeployer.sol/MockTimeAlgebraPoolDeployer.json';
import {
  abi as POOL_ABI,
  bytecode as POOL_BYTECODE,
} from '@cryptoalgebra/integral-core/artifacts/contracts/test/MockTimeAlgebraPool.sol/MockTimeAlgebraPool.json';
import {
  abi as BLAST_POINTS_MOCK_ABI,
  bytecode as BLAST_POINTS_MOCK_BYTECODE,
} from '@cryptoalgebra/integral-core/artifacts/contracts/test/BlastPointsMock.sol/BlastPointsMock.json';

import { ethers } from 'hardhat';
import {
  MockTimeAlgebraPoolDeployer,
  TestAlgebraCallee,
  MockTimeAlgebraPool,
  AlgebraFactoryUpgradeable,
  TestERC20,
  BlastMock__factory,
  BlastPointsMock,
} from '@cryptoalgebra/integral-core/typechain';
import { getCreateAddress } from 'ethers';
import { setCode } from '@nomicfoundation/hardhat-toolbox/network-helpers';

interface TokensFixture {
  token0: TestERC20;
  token1: TestERC20;
}

export async function tokensFixture(): Promise<TokensFixture> {
  const tokenFactory = await ethers.getContractFactory('TestERC20');
  const tokenA = (await tokenFactory.deploy(2n ** 255n)) as any as TestERC20 & { address: string };
  const tokenB = (await tokenFactory.deploy(2n ** 255n)) as any as TestERC20 & { address: string };

  tokenA.address = await tokenA.getAddress();
  tokenB.address = await tokenB.getAddress();

  const [token0, token1] = [tokenA, tokenB].sort((_tokenA, _tokenB) => (_tokenA.address.toLowerCase() < _tokenB.address.toLowerCase() ? -1 : 1));

  return { token0, token1 };
}

export async function createEmptyFactoryProxy(): Promise<AlgebraFactoryUpgradeable> {
  const factoryFactory = await ethers.getContractFactory(FACTORY_ABI, FACTORY_BYTECODE);

  const factoryImplementation = await factoryFactory.deploy();
  const proxyAdminFactory = await ethers.getContractFactory(PROXY_ADMIN_ABI, PROXY_ADMIN_BYTECODE);

  const proxyAdmin = await proxyAdminFactory.deploy();

  const proxyFactory = await ethers.getContractFactory(TransparentUpgradeableProxy_ABI, TransparentUpgradeableProxy_BYTECODE);
  const proxy = await proxyFactory.deploy(factoryImplementation.target, proxyAdmin.target, '0x');

  return factoryFactory.attach(proxy.target) as any as AlgebraFactoryUpgradeable;
}

interface MockPoolDeployerFixture extends TokensFixture {
  poolDeployer: MockTimeAlgebraPoolDeployer;
  swapTargetCallee: TestAlgebraCallee;
  factory: AlgebraFactoryUpgradeable;
  createPool(firstToken?: TestERC20, secondToken?: TestERC20): Promise<MockTimeAlgebraPool>;
}
export async function mockBlastPart() {
  await setCode('0x4300000000000000000000000000000000000002', BlastMock__factory.bytecode);
  const factory = await ethers.getContractFactory(BLAST_POINTS_MOCK_ABI, BLAST_POINTS_MOCK_BYTECODE);
  const blastPointsMock = (await factory.deploy()) as any as BlastPointsMock;

  return blastPointsMock;
}
export const algebraPoolDeployerMockFixture: () => Promise<MockPoolDeployerFixture> = async () => {
  let blastPoints = await mockBlastPart();
  const { token0, token1 } = await tokensFixture();

  const [deployer, governor, blastPointsOperator] = await ethers.getSigners();
  // precompute
  const poolDeployerAddress = getCreateAddress({
    from: deployer.address,
    nonce: (await ethers.provider.getTransactionCount(deployer.address)) + 1,
  });

  const factory = await createEmptyFactoryProxy();
  await factory.initialize(governor.address, poolDeployerAddress, blastPointsOperator.address, blastPoints.target);

  const poolDeployerFactory = await ethers.getContractFactory(POOL_DEPLOYER_ABI, POOL_DEPLOYER_BYTECODE);
  const poolDeployer = (await poolDeployerFactory.deploy()) as any as MockTimeAlgebraPoolDeployer;

  const calleeContractFactory = await ethers.getContractFactory(TEST_CALLEE_ABI, TEST_CALLEE_BYTECODE);
  const swapTargetCallee = (await calleeContractFactory.deploy()) as any as TestAlgebraCallee;

  const MockTimeAlgebraPoolFactory = await ethers.getContractFactory(POOL_ABI, POOL_BYTECODE);

  return {
    poolDeployer,
    swapTargetCallee,
    token0,
    token1,
    factory,
    createPool: async (firstToken = token0, secondToken = token1) => {
      await poolDeployer.deployMock(governor.address, blastPoints.target, blastPointsOperator.address, factory, firstToken, secondToken);

      const sortedTokens =
        BigInt(await firstToken.getAddress()) < BigInt(await secondToken.getAddress())
          ? [await firstToken.getAddress(), await secondToken.getAddress()]
          : [await secondToken.getAddress(), await firstToken.getAddress()];
      const poolAddress = await poolDeployer.computeAddress(sortedTokens[0], sortedTokens[1]);
      return MockTimeAlgebraPoolFactory.attach(poolAddress) as any as MockTimeAlgebraPool;
    },
  };
};
