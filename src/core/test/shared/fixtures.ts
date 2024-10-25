import { ethers } from 'hardhat';
import { getCreateAddress } from 'ethers';
import {
  MockTimeAlgebraPool,
  TestERC20,
  AlgebraCommunityVault,
  TestAlgebraCallee,
  TestAlgebraRouter,
  MockTimeAlgebraPoolDeployer,
  AlgebraPoolDeployer,
  BlastMock__factory,
  BlastMock,
  BlastPointsMock,
  AlgebraFactoryUpgradeable,
} from '../../typechain';
import { setCode } from '@nomicfoundation/hardhat-toolbox/network-helpers';

type Fixture<T> = () => Promise<T>;
interface FactoryFixture {
  factory: AlgebraFactoryUpgradeable;
  vault: AlgebraCommunityVault;
  blastPoints: BlastPointsMock;
}
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export async function mockBlastPart(): Promise<BlastPointsMock> {
  await setCode('0x4300000000000000000000000000000000000002', BlastMock__factory.bytecode);

  let blastPointsMock = (await ethers.deployContract('BlastPointsMock')) as any as BlastPointsMock;

  return blastPointsMock;
}

export async function createEmptyFactoryProxy(governor: string): Promise<AlgebraFactoryUpgradeable> {
  const factoryFactory = await ethers.getContractFactory('AlgebraFactoryUpgradeable');
  const factoryImplementation = await factoryFactory.deploy(governor);

  const proxyAdmin = await ethers.deployContract('ProxyAdmin');

  const proxyFactory = await ethers.getContractFactory('TransparentUpgradeableProxy');
  const proxy = await proxyFactory.deploy(factoryImplementation.target, proxyAdmin.target, '0x');

  return factoryFactory.attach(proxy.target) as any as AlgebraFactoryUpgradeable;
}

async function factoryFixture(): Promise<FactoryFixture> {
  let blastPointsMock = await mockBlastPart();

  const [deployer, governor, blastOperator] = await ethers.getSigners();
  // precompute
  const poolDeployerAddress = getCreateAddress({
    from: deployer.address,
    nonce: (await ethers.provider.getTransactionCount(deployer.address)) + 4,
  });

  const factory = await createEmptyFactoryProxy(governor.address);
  await factory.initialize(governor.address, blastPointsMock.target, blastOperator.address, poolDeployerAddress);

  const poolDeployerFactory = await ethers.getContractFactory('AlgebraPoolDeployer');
  const poolDeployer = (await poolDeployerFactory.deploy(governor.address, factory)) as any as AlgebraPoolDeployer;

  const vaultFactory = await ethers.getContractFactory('AlgebraCommunityVault');
  const vault = (await vaultFactory.deploy(
    governor.address,
    factory,
    deployer.address
  )) as any as AlgebraCommunityVault;

  const vaultFactoryStubFactory = await ethers.getContractFactory('AlgebraVaultFactoryStub');
  const vaultFactoryStub = await vaultFactoryStubFactory.deploy(governor.address, vault);

  await factory.setVaultFactory(vaultFactoryStub);
  return { factory, vault, blastPoints: blastPointsMock };
}
interface TokensFixture {
  token0: TestERC20;
  token1: TestERC20;
  token2: TestERC20;
}

async function tokensFixture(): Promise<TokensFixture> {
  const tokenFactory = await ethers.getContractFactory('TestERC20');
  const tokenA = (await tokenFactory.deploy(2n ** 255n)) as any as TestERC20 & { address_: string };
  const tokenB = (await tokenFactory.deploy(2n ** 255n)) as any as TestERC20 & { address_: string };
  const tokenC = (await tokenFactory.deploy(2n ** 255n)) as any as TestERC20 & { address_: string };

  tokenA.address_ = await tokenA.getAddress();
  tokenB.address_ = await tokenB.getAddress();
  tokenC.address_ = await tokenC.getAddress();

  const [token0, token1, token2] = [tokenA, tokenB, tokenC].sort((tokenA, tokenB) =>
    tokenA.address_.toLowerCase() < tokenB.address_.toLowerCase() ? -1 : 1
  );

  return { token0, token1, token2 };
}

type TokensAndFactoryFixture = FactoryFixture & TokensFixture;

interface PoolFixture extends TokensAndFactoryFixture {
  swapTargetCallee: TestAlgebraCallee;
  swapTargetRouter: TestAlgebraRouter;
  createPool(firstToken?: TestERC20, secondToken?: TestERC20): Promise<MockTimeAlgebraPool>;
}

// Monday, October 5, 2020 9:00:00 AM GMT-05:00
export const TEST_POOL_START_TIME = 1601906400;
export const TEST_POOL_DAY_BEFORE_START = 1601906400 - 24 * 60 * 60;

export const poolFixture: Fixture<PoolFixture> = async function (): Promise<PoolFixture> {
  const { factory, vault, blastPoints } = await factoryFixture();
  const { token0, token1, token2 } = await tokensFixture();
  //const { dataStorage } = await dataStorageFixture();

  const MockTimeAlgebraPoolDeployerFactory = await ethers.getContractFactory('MockTimeAlgebraPoolDeployer');
  const MockTimeAlgebraPoolFactory = await ethers.getContractFactory('MockTimeAlgebraPool');

  const calleeContractFactory = await ethers.getContractFactory('TestAlgebraCallee');
  const routerContractFactory = await ethers.getContractFactory('TestAlgebraRouter');

  const swapTargetCallee = (await calleeContractFactory.deploy()) as any as TestAlgebraCallee;
  const swapTargetRouter = (await routerContractFactory.deploy()) as any as TestAlgebraRouter;

  return {
    token0,
    token1,
    token2,
    factory,
    vault,
    swapTargetCallee,
    swapTargetRouter,
    blastPoints,
    createPool: async (firstToken = token0, secondToken = token1) => {
      const [deployer, governor, blastPointsOperator] = await ethers.getSigners();

      const mockTimePoolDeployer =
        (await MockTimeAlgebraPoolDeployerFactory.deploy()) as any as MockTimeAlgebraPoolDeployer;
      await mockTimePoolDeployer.deployMock(
        governor.address,
        blastPoints.target,
        blastPointsOperator.address,
        factory,
        firstToken,
        secondToken
      );

      const firstAddress = await firstToken.getAddress();
      const secondAddress = await secondToken.getAddress();
      const sortedTokens =
        BigInt(firstAddress) < BigInt(secondAddress) ? [firstAddress, secondAddress] : [secondAddress, firstAddress];
      const poolAddress = await mockTimePoolDeployer.computeAddress(sortedTokens[0], sortedTokens[1]);
      return MockTimeAlgebraPoolFactory.attach(poolAddress) as any as MockTimeAlgebraPool;
    },
  };
};
