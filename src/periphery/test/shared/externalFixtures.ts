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
  abi as POOL_DEPLOYER_ABI,
  bytecode as POOL_DEPLOYER_BYTECODE,
} from '@cryptoalgebra/integral-core/artifacts/contracts/AlgebraPoolDeployer.sol/AlgebraPoolDeployer.json';
import { AlgebraFactoryUpgradeable } from '@cryptoalgebra/integral-core/typechain';
import ModeSfsMock__Artifact from '@cryptoalgebra/integral-core/artifacts/contracts/test/ModeSfsMock.sol/ModeSfsMock.json';

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

export async function createEmptyFactoryProxy(): Promise<AlgebraFactoryUpgradeable> {
  const factoryFactory = await ethers.getContractFactory(FACTORY_ABI, FACTORY_BYTECODE);

  const factoryImplementation = await factoryFactory.deploy();
  const proxyAdminFactory = await ethers.getContractFactory(PROXY_ADMIN_ABI, PROXY_ADMIN_BYTECODE);

  const proxyAdmin = await proxyAdminFactory.deploy();

  const proxyFactory = await ethers.getContractFactory(
    TransparentUpgradeableProxy_ABI,
    TransparentUpgradeableProxy_BYTECODE
  );
  const proxy = await proxyFactory.deploy(factoryImplementation.target, proxyAdmin.target, '0x');

  return factoryFactory.attach(proxy.target) as any as AlgebraFactoryUpgradeable;
}
const v3CoreFactoryFixture: () => Promise<IAlgebraFactory> = async () => {
  const factoryModeSfs = await ethers.getContractFactoryFromArtifact(ModeSfsMock__Artifact);
  const modeSfs = await factoryModeSfs.deploy();
  const sfsAssignTokenId = 1;
  const [deployer] = await ethers.getSigners();
  // precompute
  const poolDeployerAddress = getCreateAddress({
    from: deployer.address,
    nonce: (await ethers.provider.getTransactionCount(deployer.address)) + 4,
  });

  const _factory = await createEmptyFactoryProxy();
  await _factory.initialize(modeSfs.target, sfsAssignTokenId, poolDeployerAddress);

  const poolDeployerFactory = await ethers.getContractFactory(POOL_DEPLOYER_ABI, POOL_DEPLOYER_BYTECODE);
  const poolDeployer = await poolDeployerFactory.deploy(modeSfs.target, sfsAssignTokenId, _factory);

  await _factory.setIsPublicPoolCreationMode(true);

  return _factory as any as IAlgebraFactory;
};

export const v3RouterFixture: () => Promise<{
  wnative: IWNativeToken;
  factory: IAlgebraFactory;
  router: MockTimeSwapRouter;
}> = async () => {
  const factoryModeSfs = await ethers.getContractFactoryFromArtifact(ModeSfsMock__Artifact);
  const modeSfs = await factoryModeSfs.deploy();
  const sfsAssignTokenId = 1;

  const { wnative } = await wnativeFixture();
  const factory = await v3CoreFactoryFixture();
  const router = (await (
    await ethers.getContractFactory('MockTimeSwapRouter')
  ).deploy(
    modeSfs.target,
    sfsAssignTokenId,
    factory,
    wnative,
    await factory.poolDeployer()
  )) as any as MockTimeSwapRouter;

  return { factory, wnative, router };
};
