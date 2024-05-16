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
import { ethers } from 'hardhat';
import { IAlgebraFactory, IWNativeToken, MockTimeSwapRouter } from '@cryptoalgebra/integral-periphery/typechain';
import {
  abi as SWAPROUTER_ABI,
  bytecode as SWAPROUTER_BYTECODE,
} from '@cryptoalgebra/integral-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';
import {
  abi as PLUGIN_FACTORY_ABI,
  bytecode as PLUGIN_FACTORY_BYTECODE,
} from '@cryptoalgebra/integral-base-plugin/artifacts/contracts/BasePluginV1Factory.sol/BasePluginV1Factory.json';
import {
  abi as BASE_PLUGIN__ABI,
  bytecode as BASE_PLUGIN_BYTECODE,
} from '@cryptoalgebra/integral-base-plugin/artifacts/contracts/AlgebraBasePluginV1.sol/AlgebraBasePluginV1.json';

import {
  abi as WNATIVE_ABI,
  bytecode as WNATIVE_BYTECODE,
} from '@cryptoalgebra/integral-periphery/artifacts/contracts/interfaces/external/IWNativeToken.sol/IWNativeToken.json';
import ModeSfsMock__Artifact from '@cryptoalgebra/integral-core/artifacts/contracts/test/ModeSfsMock.sol/ModeSfsMock.json';

//import WNativeToken from '../contracts/WNativeToken.json'
import { getCreateAddress } from 'ethers';

export const vaultAddress = '0x1d8b6fA722230153BE08C4Fa4Aa4B4c7cd01A95a';

const wnativeFixture: () => Promise<{ wnative: IWNativeToken }> = async () => {
  const wnativeFactory = await ethers.getContractFactory(WNATIVE_ABI, WNATIVE_BYTECODE);
  const wnative = (await wnativeFactory.deploy()) as any as IWNativeToken;

  return { wnative };
};

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

  const v3FactoryFactory = await ethers.getContractFactory(FACTORY_ABI, FACTORY_BYTECODE);
  const _factory = (await v3FactoryFactory.deploy(modeSfs.target, sfsAssignTokenId, poolDeployerAddress)) as any as IAlgebraFactory;

  const poolDeployerFactory = await ethers.getContractFactory(POOL_DEPLOYER_ABI, POOL_DEPLOYER_BYTECODE);
  const poolDeployer = await poolDeployerFactory.deploy(modeSfs.target, sfsAssignTokenId, _factory);
  const basePluginFactory = await ethers.getContractFactory(BASE_PLUGIN__ABI, BASE_PLUGIN_BYTECODE);

  const pluginContractFactory = await ethers.getContractFactory(PLUGIN_FACTORY_ABI, PLUGIN_FACTORY_BYTECODE);
  const pluginFactory = await pluginContractFactory.deploy(modeSfs.target, sfsAssignTokenId, _factory, (await basePluginFactory.deploy()).target);

  await _factory.setDefaultPluginFactory(pluginFactory);

  await _factory.setIsPublicPoolCreationMode(true);

  return _factory;
};

export const v3RouterFixture: () => Promise<{
  wnative: IWNativeToken;
  factory: IAlgebraFactory;
  router: MockTimeSwapRouter;
}> = async () => {
  const [dep] = await ethers.getSigners();
  const { wnative } = await wnativeFixture();
  const factory = await v3CoreFactoryFixture();
  const routerFactory = await ethers.getContractFactory(SWAPROUTER_ABI, SWAPROUTER_BYTECODE);
  const router = (await routerFactory.deploy(dep.address, factory, wnative, await factory.poolDeployer())) as any as MockTimeSwapRouter;

  return { factory, wnative, router };
};
