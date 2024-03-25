import {
  abi as FACTORY_ABI,
  bytecode as FACTORY_BYTECODE,
} from '@cryptoalgebra/integral-core/artifacts/contracts/AlgebraFactory.sol/AlgebraFactory.json';
import {
  abi as POOL_DEPLOYER_ABI,
  bytecode as POOL_DEPLOYER_BYTECODE,
} from '@cryptoalgebra/integral-core/artifacts/contracts/AlgebraPoolDeployer.sol/AlgebraPoolDeployer.json';
import {
  abi as BLAST_POINTS_MOCK_ABI,
  bytecode as BLAST_POINTS_MOCK_BYTECODE,
} from '@cryptoalgebra/integral-core/artifacts/contracts/test/BlastPointsMock.sol/BlastPointsMock.json';
import { BlastMock__factory, BlastPointsMock } from '@cryptoalgebra/integral-core/typechain';
import { setCode } from '@nomicfoundation/hardhat-toolbox/network-helpers';

import { abi as FACTORY_V2_ABI, bytecode as FACTORY_V2_BYTECODE } from '@uniswap/v2-core/build/UniswapV2Factory.json';
import { ethers } from 'hardhat';
import { IAlgebraFactory, IWNativeToken, MockTimeSwapRouter } from '../../typechain';

import WNativeToken from '../contracts/WNativeToken.json';
import { getCreateAddress, ZeroAddress } from 'ethers';

export const vaultAddress = '0x1d8b6fA722230153BE08C4Fa4Aa4B4c7cd01A95a';

const wnativeFixture: () => Promise<{ wnative: IWNativeToken }> = async () => {
  const wnativeFactory = await ethers.getContractFactory(WNativeToken.abi, WNativeToken.bytecode);
  const wnative = (await wnativeFactory.deploy()) as any as IWNativeToken;

  return { wnative };
};

export const v2FactoryFixture: () => Promise<{ factory: any }> = async () => {
  const v2FactoryFactory = await ethers.getContractFactory(FACTORY_V2_ABI, FACTORY_V2_BYTECODE);
  const factory = await v2FactoryFactory.deploy(ZeroAddress);

  return { factory };
};

export async function mockBlastPart() {
  await setCode('0x4300000000000000000000000000000000000002', BlastMock__factory.bytecode);
  const factory = await ethers.getContractFactory(BLAST_POINTS_MOCK_ABI, BLAST_POINTS_MOCK_BYTECODE);
  const blastPointsMock = (await factory.deploy()) as any as BlastPointsMock;

  return blastPointsMock;
}

const v3CoreFactoryFixture: () => Promise<IAlgebraFactory> = async () => {
  let blastPoints = await mockBlastPart();

  const [deployer, blastOperator] = await ethers.getSigners();
  // precompute
  const poolDeployerAddress = getCreateAddress({
    from: deployer.address,
    nonce: (await ethers.provider.getTransactionCount(deployer.address)) + 1,
  });

  const v3FactoryFactory = await ethers.getContractFactory(FACTORY_ABI, FACTORY_BYTECODE);
  const _factory = (await v3FactoryFactory.deploy(
    deployer.address,
    blastPoints.target,
    blastOperator.address,
    poolDeployerAddress
  )) as any as IAlgebraFactory;

  const poolDeployerFactory = await ethers.getContractFactory(POOL_DEPLOYER_ABI, POOL_DEPLOYER_BYTECODE);
  const poolDeployer = await poolDeployerFactory.deploy(deployer.address, _factory);

  await _factory.setIsPublicPoolCreationMode(true);

  return _factory;
};

export const v3RouterFixture: () => Promise<{
  wnative: IWNativeToken;
  factory: IAlgebraFactory;
  router: MockTimeSwapRouter;
}> = async () => {
  const [deployer] = await ethers.getSigners();

  const { wnative } = await wnativeFixture();
  const factory = await v3CoreFactoryFixture();
  const router = (await (
    await ethers.getContractFactory('MockTimeSwapRouter')
  ).deploy(deployer.address, factory, wnative, await factory.poolDeployer())) as any as MockTimeSwapRouter;

  return { factory, wnative, router };
};
