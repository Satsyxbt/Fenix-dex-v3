import { ethers } from 'hardhat';
import { MockFactory, MockPool, MockTimeAlgebraBasePluginV1, MockTimeDSFactory, BasePluginV1Factory } from '../../typechain';
import { setCode } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { BlastMock__factory } from '@cryptoalgebra/integral-core/typechain';

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
}

// Monday, October 5, 2020 9:00:00 AM GMT-05:00
export const TEST_POOL_START_TIME = 1601906400;
export const TEST_POOL_DAY_BEFORE_START = 1601906400 - 24 * 60 * 60;

export async function mockBlastPart() {
  await setCode('0x4300000000000000000000000000000000000002', BlastMock__factory.bytecode);
  await setCode('0x2fc95838c71e76ec69ff817983BFf17c710F34E0', BlastMock__factory.bytecode);
  await setCode('0x2536FE9ab3F511540F2f9e2eC2A805005C3Dd800', BlastMock__factory.bytecode);
}

export const pluginFixture: Fixture<PluginFixture> = async function (): Promise<PluginFixture> {
  await mockBlastPart();

  const [deployer, governor] = await ethers.getSigners();

  const { mockFactory } = await mockFactoryFixture();
  //const { token0, token1, token2 } = await tokensFixture()
  const mockDSOperatorFactory = await ethers.getContractFactory('MockTimeAlgebraBasePluginV1');
  const pluginImplementation = await mockDSOperatorFactory.deploy();

  const mockPluginFactoryFactory = await ethers.getContractFactory('MockTimeDSFactory');
  const mockPluginFactory = (await mockPluginFactoryFactory.deploy(
    governor.address,
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
  };
};

interface PluginFactoryFixture extends MockFactoryFixture {
  pluginFactory: BasePluginV1Factory;
}

export const pluginFactoryFixture: Fixture<PluginFactoryFixture> = async function (): Promise<PluginFactoryFixture> {
  await mockBlastPart();
  const { mockFactory } = await mockFactoryFixture();
  const AlgebraBasePluginV1Factory = await ethers.getContractFactory('AlgebraBasePluginV1');
  const pluginImplementation = await AlgebraBasePluginV1Factory.deploy();

  const pluginFactoryFactory = await ethers.getContractFactory('BasePluginV1Factory');
  const [deployer, governor] = await ethers.getSigners();
  const pluginFactory = (await pluginFactoryFactory.deploy(governor.address, mockFactory, pluginImplementation.target)) as any as BasePluginV1Factory;

  return {
    pluginFactory,
    mockFactory,
  };
};
