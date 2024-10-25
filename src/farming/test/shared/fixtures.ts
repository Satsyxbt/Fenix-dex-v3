import { Signer, Wallet, getCreateAddress, MaxUint256 } from 'ethers';
import { ethers } from 'hardhat';
import AlgebraPool from '@cryptoalgebra/integral-core/artifacts/contracts/AlgebraPool.sol/AlgebraPool.json';
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
import AlgebraPoolDeployerJson from '@cryptoalgebra/integral-core/artifacts/contracts/AlgebraPoolDeployer.sol/AlgebraPoolDeployer.json';
import NFTDescriptorJson from '@cryptoalgebra/integral-periphery/artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json';
import NonfungiblePositionManagerJson from '@cryptoalgebra/integral-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json';
import NonfungibleTokenPositionDescriptor from '@cryptoalgebra/integral-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json';
import SwapRouter from '@cryptoalgebra/integral-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';
import WNativeToken from './external/WNativeToken.json';
import { linkLibraries } from './linkLibraries';
import { ISwapRouter, IWNativeToken, NFTDescriptor } from '@cryptoalgebra/integral-periphery/typechain';
import {
  abi as PLUGIN_FACTORY_ABI,
  bytecode as PLUGIN_FACTORY_BYTECODE,
} from '@cryptoalgebra/integral-base-plugin/artifacts/contracts/BasePluginV1Factory.sol/BasePluginV1Factory.json';

import {
  abi as PLUGIN_ABI,
  bytecode as PLUGIN_BYTECODE,
} from '@cryptoalgebra/integral-base-plugin/artifacts/contracts/AlgebraBasePluginV1.sol/AlgebraBasePluginV1.json';
import {
  AlgebraEternalFarming,
  TestERC20,
  INonfungiblePositionManager,
  IAlgebraFactory,
  IAlgebraPoolDeployer,
  IAlgebraPool,
  TestIncentiveId,
  FarmingCenter,
} from '../../typechain';
import { FeeAmount, encodePriceSqrt, MAX_GAS_LIMIT } from '../shared';
import { ActorFixture } from './actors';
import { IBasePluginV1Factory, IAlgebraBasePluginV1 } from '@cryptoalgebra/integral-base-plugin/typechain';
import {
  abi as BLAST_POINTS_MOCK_ABI,
  bytecode as BLAST_POINTS_MOCK_BYTECODE,
} from '@cryptoalgebra/integral-core/artifacts/contracts/test/BlastPointsMock.sol/BlastPointsMock.json';
import { setCode } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { AlgebraFactoryUpgradeable, BlastMock__factory, BlastPointsMock } from '@cryptoalgebra/integral-core/typechain';

type WNativeTokenFixture = { wnative: IWNativeToken };

type TestERC20WithAddress = TestERC20 & { address: string };

export const vaultAddress = '0x1d8b6fA722230153BE08C4Fa4Aa4B4c7cd01A95a';

export const wnativeFixture: () => Promise<WNativeTokenFixture> = async () => {
  const wnativeFactory = await ethers.getContractFactory(WNativeToken.abi, WNativeToken.bytecode);
  const wnative = (await wnativeFactory.deploy()) as any as IWNativeToken;

  return { wnative };
};

export async function mockBlastPart() {
  await setCode('0x4300000000000000000000000000000000000002', BlastMock__factory.bytecode);
  const factory = await ethers.getContractFactory(BLAST_POINTS_MOCK_ABI, BLAST_POINTS_MOCK_BYTECODE);
  const blastPointsMock = (await factory.deploy()) as any as BlastPointsMock;

  return blastPointsMock;
}

export async function createEmptyFactoryProxy(governor: string): Promise<AlgebraFactoryUpgradeable> {
  const factoryFactory = await ethers.getContractFactory(FACTORY_ABI, FACTORY_BYTECODE);

  const factoryImplementation = await factoryFactory.deploy(governor);
  const proxyAdminFactory = await ethers.getContractFactory(PROXY_ADMIN_ABI, PROXY_ADMIN_BYTECODE);

  const proxyAdmin = await proxyAdminFactory.deploy();

  const proxyFactory = await ethers.getContractFactory(TransparentUpgradeableProxy_ABI, TransparentUpgradeableProxy_BYTECODE);
  const proxy = await proxyFactory.deploy(factoryImplementation.target, proxyAdmin.target, '0x');

  return factoryFactory.attach(proxy.target) as any as AlgebraFactoryUpgradeable;
}
const v3CoreFactoryFixture: () => Promise<[IAlgebraFactory, IAlgebraPoolDeployer, IBasePluginV1Factory, Signer]> = async () => {
  let blastPoints = await mockBlastPart();

  const [deployer, blastGovernor, blastPointsOperator] = await ethers.getSigners();
  // precompute
  const poolDeployerAddress = getCreateAddress({
    from: deployer.address,
    nonce: (await ethers.provider.getTransactionCount(deployer.address)) + 4,
  });

  const _factory = await createEmptyFactoryProxy(blastGovernor.address);
  await _factory.initialize(blastGovernor.address, blastPoints.target, blastPointsOperator.address, poolDeployerAddress);

  const poolDeployerFactory = await ethers.getContractFactory(AlgebraPoolDeployerJson.abi, AlgebraPoolDeployerJson.bytecode);
  const _deployer = (await poolDeployerFactory.deploy(blastGovernor.address, _factory)) as any as IAlgebraPoolDeployer;
  const basePluginFactory = await ethers.getContractFactory(PLUGIN_ABI, PLUGIN_BYTECODE);

  const pluginContractFactory = await ethers.getContractFactory(PLUGIN_FACTORY_ABI, PLUGIN_FACTORY_BYTECODE);
  const pluginFactory = (await pluginContractFactory.deploy(
    blastGovernor.address,
    _factory,
    (
      await basePluginFactory.deploy()
    ).target
  )) as any as IBasePluginV1Factory;

  await _factory.setDefaultPluginFactory(pluginFactory);
  await _factory.setIsPublicPoolCreationMode(true);

  return [_factory as any as IAlgebraFactory, _deployer, pluginFactory, deployer];
};

export const v3RouterFixture: () => Promise<{
  wnative: IWNativeToken;
  factory: IAlgebraFactory;
  deployer: IAlgebraPoolDeployer;
  router: ISwapRouter;
  pluginFactory: IBasePluginV1Factory;
  ownerSigner: Signer;
}> = async () => {
  const [depl] = await ethers.getSigners();
  const { wnative } = await wnativeFixture();
  const [factory, deployer, pluginFactory, ownerSigner] = await v3CoreFactoryFixture();
  const routerFactory = await ethers.getContractFactory(SwapRouter.abi, SwapRouter.bytecode);
  const router = (await routerFactory.deploy(depl.address, factory, wnative, deployer)) as any as ISwapRouter;

  return { factory, wnative, deployer, router, pluginFactory, ownerSigner };
};

const nftDescriptorLibraryFixture: () => Promise<NFTDescriptor> = async () => {
  const NFTDescriptorFactory = await ethers.getContractFactory(NFTDescriptorJson.abi, NFTDescriptorJson.bytecode);
  return (await NFTDescriptorFactory.deploy()) as any as NFTDescriptor;
};

type AlgebraFactoryFixture = {
  wnative: IWNativeToken;
  factory: IAlgebraFactory;
  deployer: IAlgebraPoolDeployer;
  router: ISwapRouter;
  nft: INonfungiblePositionManager;
  tokens: [TestERC20, TestERC20, TestERC20, TestERC20];
  pluginFactory: IBasePluginV1Factory;
  ownerSigner: Signer;
};

export const algebraFactoryFixture: () => Promise<AlgebraFactoryFixture> = async () => {
  const { wnative, factory, deployer, router, pluginFactory, ownerSigner } = await v3RouterFixture();

  const tokenFactory = await ethers.getContractFactory('TestERC20');
  const tokens = (await Promise.all([
    tokenFactory.deploy(MaxUint256 / 2n), // do not use maxu256 to avoid overflowing
    tokenFactory.deploy(MaxUint256 / 2n),
    tokenFactory.deploy(MaxUint256 / 2n),
    tokenFactory.deploy(MaxUint256 / 2n),
  ])) as [any, any, any, any] as [TestERC20WithAddress, TestERC20WithAddress, TestERC20WithAddress, TestERC20WithAddress];

  const nftDescriptorLibrary = await nftDescriptorLibraryFixture();
  const linkedBytecode = linkLibraries(
    {
      bytecode: NonfungibleTokenPositionDescriptor.bytecode,
      linkReferences: {
        'NFTDescriptor.sol': {
          NFTDescriptor: [
            {
              length: 20,
              start: NonfungibleTokenPositionDescriptor.linkReferences['contracts/libraries/NFTDescriptor.sol'].NFTDescriptor[0].start,
            },
          ],
        },
      },
    },
    {
      NFTDescriptor: await nftDescriptorLibrary.getAddress(),
    }
  );

  const NFTDescriptorFactory = await ethers.getContractFactory(NonfungibleTokenPositionDescriptor.abi, linkedBytecode);

  const positionDescriptor = await NFTDescriptorFactory.deploy(tokens[0], 'ETH', []);

  const nftFactory = await ethers.getContractFactory(NonfungiblePositionManagerJson.abi, NonfungiblePositionManagerJson.bytecode);
  const [deploy] = await ethers.getSigners();

  const nft = (await nftFactory.deploy(deploy.address, factory, wnative, positionDescriptor, deployer)) as any as INonfungiblePositionManager;
  for (const token of tokens) {
    token.address = await token.getAddress();
  }
  tokens.sort((a, b) => (a.address.toLowerCase() < b.address.toLowerCase() ? -1 : 1));

  return {
    wnative,
    factory,
    deployer,
    router,
    tokens,
    nft,
    pluginFactory,
    ownerSigner,
  };
};

export const mintPosition = async (
  nft: INonfungiblePositionManager,
  mintParams: {
    token0: string | TestERC20;
    token1: string | TestERC20;
    fee: FeeAmount;
    tickLower: number;
    tickUpper: number;
    recipient: string;
    amount0Desired: any;
    amount1Desired: any;
    amount0Min: number;
    amount1Min: number;
    deadline: number;
  }
): Promise<string> => {
  let tokenId: bigint | undefined;

  if (typeof mintParams.token0 != 'string') mintParams.token0 = await mintParams.token0.getAddress();
  if (typeof mintParams.token1 != 'string') mintParams.token1 = await mintParams.token1.getAddress();

  const receipt = await (
    await nft.mint(
      {
        token0: mintParams.token0,
        token1: mintParams.token1,
        tickLower: mintParams.tickLower,
        tickUpper: mintParams.tickUpper,
        recipient: mintParams.recipient,
        amount0Desired: mintParams.amount0Desired,
        amount1Desired: mintParams.amount1Desired,
        amount0Min: mintParams.amount0Min,
        amount1Min: mintParams.amount1Min,
        deadline: mintParams.deadline,
      },
      {
        gasLimit: MAX_GAS_LIMIT,
      }
    )
  ).wait();

  const nftAddress = await nft.getAddress();
  if (!receipt) throw new Error('No receipt');

  for (let i = 0; i < receipt.logs.length; i++) {
    const log = receipt.logs[i];
    if (log.address === nftAddress) {
      const event = nft.interface.parseLog(log as any as { topics: string[]; data: string });
      if (event?.name == 'Transfer') {
        tokenId = event.args?.tokenId;
        break;
      }
    }
  }

  if (tokenId === undefined) {
    throw 'could not find tokenId after mint';
  } else {
    return tokenId.toString();
  }
};

export type AlgebraFixtureType = {
  deployer: IAlgebraPoolDeployer;
  fee: FeeAmount;
  nft: INonfungiblePositionManager;
  pool01: string;
  pool12: string;
  factory: IAlgebraFactory;
  poolObj: IAlgebraPool;
  pluginObj: IAlgebraBasePluginV1;
  pluginFactory: IBasePluginV1Factory;
  router: ISwapRouter;
  eternalFarming: AlgebraEternalFarming;
  farmingCenter: FarmingCenter;
  testIncentiveId: TestIncentiveId;
  tokens: [TestERC20, TestERC20, TestERC20, TestERC20];
  token0: TestERC20;
  token1: TestERC20;
  rewardToken: TestERC20;
  bonusRewardToken: TestERC20;
  ownerSigner: Signer;
};

export const algebraFixture: () => Promise<AlgebraFixtureType> = async () => {
  const { tokens, nft, factory, deployer, router, pluginFactory, ownerSigner } = await algebraFactoryFixture();
  const wallets = (await ethers.getSigners()) as any as Wallet[];
  const signer = new ActorFixture(wallets, ethers.provider).farmingDeployer();

  const incentiveCreator = new ActorFixture(wallets, ethers.provider).incentiveCreator();

  const eternalFarmingFactory = await ethers.getContractFactory('AlgebraEternalFarming', signer);
  const eternalFarming = (await eternalFarmingFactory.deploy(wallets[0].address, deployer, nft)) as any as AlgebraEternalFarming;

  const farmingCenterFactory = await ethers.getContractFactory('FarmingCenter', signer);

  const farmingCenter = (await farmingCenterFactory.deploy(wallets[1].address, eternalFarming, nft)) as any as FarmingCenter;

  await nft.setFarmingCenter(farmingCenter);

  await eternalFarming.connect(ownerSigner).setFarmingCenterAddress(farmingCenter);

  const incentiveMakerRole = await eternalFarming.INCENTIVE_MAKER_ROLE();

  await (factory as any as IAccessControl).grantRole(incentiveMakerRole, incentiveCreator.address);

  await pluginFactory.setFarmingAddress(farmingCenter);

  const testIncentiveIdFactory = await ethers.getContractFactory('TestIncentiveId', signer);
  const testIncentiveId = (await testIncentiveIdFactory.deploy()) as any as TestIncentiveId;

  for (const token of tokens) {
    await token.approve(nft, MaxUint256);
  }

  const fee = FeeAmount.MEDIUM;

  await nft.createAndInitializePoolIfNecessary(tokens[0], tokens[1], encodePriceSqrt(1, 1));

  await nft.createAndInitializePoolIfNecessary(tokens[1], tokens[2], encodePriceSqrt(1, 1));

  const pool01 = await factory.poolByPair(tokens[0], tokens[1]);

  const pool12 = await factory.poolByPair(tokens[1], tokens[2]);

  const poolObj = poolFactory.attach(pool01) as any as IAlgebraPool;

  const pluginContractFactory = new ethers.ContractFactory(PLUGIN_ABI, PLUGIN_BYTECODE, signer);

  const pluginObj = pluginContractFactory.attach(await poolObj.connect(signer).plugin()) as any as IAlgebraBasePluginV1;

  return {
    nft,
    router,
    tokens,
    eternalFarming,
    farmingCenter,
    testIncentiveId,
    deployer,
    factory,
    pool01,
    pool12,
    fee,
    poolObj,
    pluginObj,
    pluginFactory,
    token0: tokens[0],
    token1: tokens[1],
    rewardToken: tokens[2],
    bonusRewardToken: tokens[1],
    ownerSigner,
  };
};

export const poolFactory = new ethers.ContractFactory(AlgebraPool.abi, AlgebraPool.bytecode);
