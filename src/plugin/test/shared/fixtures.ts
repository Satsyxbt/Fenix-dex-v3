import { ethers } from 'hardhat';
import { MockFactory, MockPool, MockTimeAlgebraBasePluginV1, MockTimeDSFactory, BasePluginV1Factory } from '../../typechain';
import ModeSfsMock__Artifact from '@cryptoalgebra/integral-core/artifacts/contracts/test/ModeSfsMock.sol/ModeSfsMock.json';
import { ModeSfsMock } from '@cryptoalgebra/integral-core/typechain';

type Fixture<T> = () => Promise<T>;
interface MockFactoryFixture {
  mockFactory: MockFactory;
}
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

async function mockFactoryFixture(): Promise<MockFactoryFixture> {
  const mockFactoryFactory = await ethers.getContractFactory('MockFactory');
  const mockFactory = (await mockFactoryFactory.deploy()) as any as MockFactory;

  return { mockFactory };
}

interface PluginFixture extends MockFactoryFixture {
  plugin: MockTimeAlgebraBasePluginV1;
  mockPluginFactory: MockTimeDSFactory;
  mockPool: MockPool;
  modeSfs: ModeSfsMock;
  sfsAssignTokenId: number;
}

// Monday, October 5, 2020 9:00:00 AM GMT-05:00
export const TEST_POOL_START_TIME = 1601906400;
export const TEST_POOL_DAY_BEFORE_START = 1601906400 - 24 * 60 * 60;

export const pluginFixture: Fixture<PluginFixture> = async function (): Promise<PluginFixture> {
  const factoryModeSfs = await ethers.getContractFactoryFromArtifact(ModeSfsMock__Artifact);
  const modeSfs = (await factoryModeSfs.deploy()) as any as ModeSfsMock;
  const sfsAssignTokenId = 1;

  const [deployer] = await ethers.getSigners();

  const { mockFactory } = await mockFactoryFixture();
  //const { token0, token1, token2 } = await tokensFixture()
  const mockDSOperatorFactory = await ethers.getContractFactory('MockTimeAlgebraBasePluginV1');
  const pluginImplementation = await mockDSOperatorFactory.deploy();

  const mockPluginFactoryFactory = await ethers.getContractFactory('MockTimeDSFactory');
  const mockPluginFactory = (await mockPluginFactoryFactory.deploy(
    modeSfs.target,
    sfsAssignTokenId,
    mockFactory,
    pluginImplementation.target
  )) as any as MockTimeDSFactory;

  const mockPoolFactory = await ethers.getContractFactory('MockPool');
  const mockPool = (await mockPoolFactory.deploy()) as any as MockPool;

  await mockPluginFactory.createPlugin(mockPool, ZERO_ADDRESS, ZERO_ADDRESS);
  const pluginAddress = await mockPluginFactory.pluginByPool(mockPool);

  const plugin = mockDSOperatorFactory.attach(pluginAddress) as any as MockTimeAlgebraBasePluginV1;

  return {
    plugin,
    mockPluginFactory,
    mockPool,
    mockFactory,
    modeSfs,
    sfsAssignTokenId,
  };
};

interface PluginFactoryFixture extends MockFactoryFixture {
  pluginFactory: BasePluginV1Factory;
  modeSfs: ModeSfsMock;
  sfsAssignTokenId: number;
}

export const pluginFactoryFixture: Fixture<PluginFactoryFixture> = async function (): Promise<PluginFactoryFixture> {
  const factoryModeSfs = await ethers.getContractFactoryFromArtifact(ModeSfsMock__Artifact);
  const modeSfs = (await factoryModeSfs.deploy()) as any as ModeSfsMock;
  const sfsAssignTokenId = 1;

  const { mockFactory } = await mockFactoryFixture();
  const AlgebraBasePluginV1Factory = await ethers.getContractFactory('AlgebraBasePluginV1');
  const pluginImplementation = await AlgebraBasePluginV1Factory.deploy();

  const pluginFactoryFactory = await ethers.getContractFactory('BasePluginV1Factory');
  const [deployer, governor] = await ethers.getSigners();
  const pluginFactory = (await pluginFactoryFactory.deploy(
    modeSfs.target,
    sfsAssignTokenId,
    mockFactory,
    pluginImplementation.target
  )) as any as BasePluginV1Factory;

  return {
    pluginFactory,
    mockFactory,
    modeSfs,
    sfsAssignTokenId,
  };
};
