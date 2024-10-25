import { Wallet, getCreateAddress, ZeroAddress, keccak256 } from 'ethers';
import { ethers } from 'hardhat';
import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers';
import {
  AlgebraFactoryUpgradeable,
  AlgebraPool,
  AlgebraPoolDeployer,
  BlastGovernorMock,
  BlastPointsMock,
  ERC20RebasingMock,
  MockDefaultPluginFactory,
} from '../typechain';
import { expect } from './shared/expect';
import { ZERO_ADDRESS, mockBlastPart, createEmptyFactoryProxy } from './shared/fixtures';
import snapshotGasCost from './shared/snapshotGasCost';

import { getCreate2Address, encodePriceSqrt } from './shared/utilities';

const TEST_ADDRESSES: [string, string, string] = [
  '0x1000000000000000000000000000000000000000',
  '0x2000000000000000000000000000000000000000',
  '0x3000000000000000000000000000000000000000',
];

describe('AlgebraFactoryUpgradeable', () => {
  let wallet: Wallet, other: Wallet, blastGovernor: Wallet, blastOperator: Wallet;

  let factory: AlgebraFactoryUpgradeable;
  let poolDeployer: AlgebraPoolDeployer;
  let poolBytecode: string;
  let defaultPluginFactory: MockDefaultPluginFactory;
  let blastPoints: BlastPointsMock;

  const fixture = async () => {
    let blastPoints = await mockBlastPart();

    const [deployer, governor, blastOperator] = await ethers.getSigners();
    // precompute
    const poolDeployerAddress = getCreateAddress({
      from: deployer.address,
      nonce: (await ethers.provider.getTransactionCount(deployer.address)) + 4,
    });

    let factory = await createEmptyFactoryProxy(governor.address);
    await factory.initialize(governor.address, blastPoints.target, blastOperator.address, poolDeployerAddress);

    const poolDeployerFactory = await ethers.getContractFactory('AlgebraPoolDeployer');
    const poolDeployer = (await poolDeployerFactory.deploy(governor.address, factory)) as any as AlgebraPoolDeployer;

    const vaultFactory = await ethers.getContractFactory('AlgebraCommunityVault');
    const vault = await vaultFactory.deploy(governor.address, factory, deployer.address);

    const vaultFactoryStubFactory = await ethers.getContractFactory('AlgebraVaultFactoryStub');
    const vaultFactoryStub = await vaultFactoryStubFactory.deploy(governor.address, vault);

    await factory.setVaultFactory(vaultFactoryStub);

    const defaultPluginFactoryFactory = await ethers.getContractFactory('MockDefaultPluginFactory');
    const defaultPluginFactory = (await defaultPluginFactoryFactory.deploy()) as any as MockDefaultPluginFactory;

    return { factory, poolDeployer, defaultPluginFactory, blastPoints };
  };

  before('create fixture loader', async () => {
    [wallet, blastGovernor, blastOperator, other] = await (ethers as any).getSigners();
  });

  before('load pool bytecode', async () => {
    poolBytecode = (await ethers.getContractFactory('AlgebraPool')).bytecode;
  });

  beforeEach('deploy factory', async () => {
    ({ factory, poolDeployer, defaultPluginFactory, blastPoints } = await loadFixture(fixture));
  });

  it('fail if try initialize on implementation', async () => {
    const factoryFactory = await ethers.getContractFactory('AlgebraFactoryUpgradeable');
    const factoryImplementation = await factoryFactory.deploy(blastGovernor.address);
    await expect(
      factoryImplementation.initialize(
        blastGovernor.address,
        blastPoints.target,
        blastOperator.address,
        poolDeployer.target
      )
    ).to.be.revertedWith('Initializable: contract is already initialized');
  });

  it('fail if try second initialize on proxy', async () => {
    await expect(
      factory.initialize(blastGovernor.address, blastPoints.target, blastOperator.address, poolDeployer.target)
    ).to.be.revertedWith('Initializable: contract is already initialized');
  });

  it('fail if provide zero address like poolDeployer', async () => {
    const factory = await createEmptyFactoryProxy(blastGovernor.address);
    await expect(factory.initialize(blastGovernor.address, blastPoints.target, blastOperator.address, ZERO_ADDRESS)).to
      .be.reverted;
  });

  it('fail if provide zero address like blastGovernor', async () => {
    const factory = await createEmptyFactoryProxy(blastGovernor.address);
    await expect(factory.initialize(ZERO_ADDRESS, blastPoints.target, blastOperator.address, poolDeployer.target)).to.be
      .reverted;
  });

  it('fail if provide zero address like blastPoints', async () => {
    const factory = await createEmptyFactoryProxy(blastGovernor.address);
    await expect(factory.initialize(blastGovernor.address, ZERO_ADDRESS, blastOperator.address, poolDeployer.target)).to
      .be.reverted;
  });

  it('fail if provide zero address like blastOperator', async () => {
    const factory = await createEmptyFactoryProxy(blastGovernor.address);
    await expect(factory.initialize(blastGovernor.address, blastPoints.target, ZERO_ADDRESS, poolDeployer.target)).to.be
      .reverted;
  });

  it('cannot create vault factory stub with zero algebra community vault address', async () => {
    const vaultFactoryStubFactory = await ethers.getContractFactory('AlgebraVaultFactoryStub');
    expect(vaultFactoryStubFactory.deploy(blastGovernor.address, ZeroAddress)).to.be.revertedWithoutReason;
  });

  it('corect default blast governor', async () => {
    expect(await factory.defaultBlastGovernor()).to.eq(blastGovernor.address);
  });

  it('rebasingTokensGovernor is zero by default', async () => {
    expect(await factory.rebasingTokensGovernor()).to.eq(ethers.ZeroAddress);
  });

  it('corect default blast points', async () => {
    expect(await factory.defaultBlastPoints()).to.eq(blastPoints.target);
  });

  it('corect default blast points operator', async () => {
    expect(await factory.defaultBlastPointsOperator()).to.eq(blastOperator.address);
  });

  it('owner is deployer', async () => {
    expect(await factory.owner()).to.eq(wallet.address);
  });

  it('public pool creation mode is disabled by default', async () => {
    expect(await factory.isPublicPoolCreationMode()).to.be.false;
  });

  it('owner is POOLS_CREATOR_ROLE by default', async () => {
    expect(await factory.hasRole(await factory.POOLS_CREATOR_ROLE(), await factory.owner())).to.be.true;
  });

  it('has POOL_INIT_CODE_HASH', async () => {
    expect(await factory.POOL_INIT_CODE_HASH()).to.be.not.eq(
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    );
  });

  it('has POOLS_ADMINISTRATOR_ROLE', async () => {
    expect(await factory.POOLS_ADMINISTRATOR_ROLE()).to.be.eq(
      '0xb73ce166ead2f8e9add217713a7989e4edfba9625f71dfd2516204bb67ad3442'
    );
  });

  it('has POOLS_CREATOR_ROLE', async () => {
    expect(await factory.POOLS_CREATOR_ROLE()).to.be.eq(
      '0xa7106ea771a74f2d048c62cace8c00d3e120b24b61327e6415035f60d47ce888'
    );
  });

  it('has correct POOL_INIT_CODE_HASH [ @skip-on-coverage ]', async () => {
    expect(await factory.POOL_INIT_CODE_HASH()).to.be.eq(keccak256(poolBytecode));
  });

  it('cannot deploy factory with incorrect poolDeployer', async () => {
    const factory = await createEmptyFactoryProxy(blastGovernor.address);
    await expect(factory.initialize(blastGovernor.address, blastPoints.target, ZERO_ADDRESS, poolDeployer.target)).to.be
      .reverted;
    expect(factory.initialize(blastGovernor.address, blastPoints.target, blastOperator.address, ZERO_ADDRESS)).to.be
      .revertedWithoutReason;
  });

  it('factory bytecode size  [ @skip-on-coverage ]', async () => {
    expect(((await ethers.provider.getCode(factory)).length - 2) / 2).to.matchSnapshot();
  });

  it('pool bytecode size  [ @skip-on-coverage ]', async () => {
    await factory.createPool(TEST_ADDRESSES[0], TEST_ADDRESSES[1]);
    const poolAddress = getCreate2Address(
      await poolDeployer.getAddress(),
      [TEST_ADDRESSES[0], TEST_ADDRESSES[1]],
      poolBytecode
    );
    expect(((await ethers.provider.getCode(poolAddress)).length - 2) / 2).to.matchSnapshot();
  });

  async function createAndCheckPool(tokens: [string, string], skipEqTokenCheck?: boolean) {
    const create2Address = getCreate2Address(await poolDeployer.getAddress(), tokens, poolBytecode);
    const create = factory.createPool(tokens[0], tokens[1]);

    await expect(create).to.emit(factory, 'Pool');

    await expect(factory.createPool(tokens[0], tokens[1])).to.be.reverted;
    await expect(factory.createPool(tokens[1], tokens[0])).to.be.reverted;
    expect(await factory.poolByPair(tokens[0], tokens[1]), 'getPool in order').to.eq(create2Address);
    expect(await factory.poolByPair(tokens[1], tokens[0]), 'getPool in reverse').to.eq(create2Address);

    const poolContractFactory = await ethers.getContractFactory('AlgebraPool');
    const pool = poolContractFactory.attach(create2Address);
    expect(await pool.factory(), 'pool factory address').to.eq(await factory.getAddress());
    if (!skipEqTokenCheck) {
      expect(await pool.token0(), 'pool token0').to.eq(TEST_ADDRESSES[0]);
      expect(await pool.token1(), 'pool token1').to.eq(TEST_ADDRESSES[1]);
    }
  }

  describe('#createPool', () => {
    it('succeeds for pool', async () => {
      await createAndCheckPool([TEST_ADDRESSES[0], TEST_ADDRESSES[1]]);
    });

    it('succeeds if tokens are passed in reverse', async () => {
      await createAndCheckPool([TEST_ADDRESSES[1], TEST_ADDRESSES[0]]);
    });

    it('correctly computes pool address [ @skip-on-coverage ]', async () => {
      await factory.setDefaultPluginFactory(defaultPluginFactory);
      await createAndCheckPool([TEST_ADDRESSES[0], TEST_ADDRESSES[1]]);

      let poolAddress = await factory.poolByPair(TEST_ADDRESSES[0], TEST_ADDRESSES[1]);
      const addressCalculatedByFactory = await factory.computePoolAddress(TEST_ADDRESSES[0], TEST_ADDRESSES[1]);

      expect(addressCalculatedByFactory).to.be.eq(poolAddress);
    });

    it('succeeds if defaultPluginFactory set [ @skip-on-coverage ]', async () => {
      await factory.setDefaultPluginFactory(defaultPluginFactory);
      await createAndCheckPool([TEST_ADDRESSES[0], TEST_ADDRESSES[1]]);

      let poolAddress = await factory.poolByPair(TEST_ADDRESSES[0], TEST_ADDRESSES[1]);
      let pluginAddress = await defaultPluginFactory.pluginsForPools(poolAddress);

      const poolContractFactory = await ethers.getContractFactory('AlgebraPool');
      let pool = poolContractFactory.attach(poolAddress);
      expect(await pool.plugin()).to.be.eq(pluginAddress);
    });

    it('creates plugin in defaultPluginFactory', async () => {
      await factory.setDefaultPluginFactory(defaultPluginFactory);
      await createAndCheckPool([TEST_ADDRESSES[0], TEST_ADDRESSES[1]]);

      let poolAddress = await factory.poolByPair(TEST_ADDRESSES[0], TEST_ADDRESSES[1]);
      // in coverage mode bytecode hash can be different from specified in factory
      let pluginAddress = await defaultPluginFactory.pluginsForPools(
        await factory.computePoolAddress(TEST_ADDRESSES[0], TEST_ADDRESSES[1])
      );

      const poolContractFactory = await ethers.getContractFactory('AlgebraPool');
      let pool = poolContractFactory.attach(poolAddress);
      expect(await pool.plugin()).to.be.eq(pluginAddress);
    });

    it('sets vault in pool', async () => {
      await createAndCheckPool([TEST_ADDRESSES[0], TEST_ADDRESSES[1]]);

      let poolAddress = await factory.poolByPair(TEST_ADDRESSES[0], TEST_ADDRESSES[1]);
      const poolContractFactory = await ethers.getContractFactory('AlgebraPool');
      let pool = poolContractFactory.attach(poolAddress);

      await pool.initialize(encodePriceSqrt(1, 1));
      expect(await pool.communityVault()).to.not.eq(ZeroAddress);
    });

    it('works without community vault factory', async () => {
      await factory.setVaultFactory(ZeroAddress);
      await createAndCheckPool([TEST_ADDRESSES[0], TEST_ADDRESSES[1]]);

      let poolAddress = await factory.poolByPair(TEST_ADDRESSES[0], TEST_ADDRESSES[1]);
      const poolContractFactory = await ethers.getContractFactory('AlgebraPool');
      let pool = poolContractFactory.attach(poolAddress);
      await pool.initialize(encodePriceSqrt(1, 1));
      expect(await pool.communityVault()).to.eq(ZeroAddress);
    });

    it('without isRebaseToken', async () => {
      const f = await ethers.getContractFactory('ERC20RebasingMock');
      const token0 = (await f.deploy()) as any as ERC20RebasingMock;
      const token1 = (await f.deploy()) as any as ERC20RebasingMock;

      expect(await factory.configurationForBlastRebaseTokens(token0.target)).to.be.eq(0);
      expect(await factory.isRebaseToken(token0.target)).to.be.eq(false);

      expect(await factory.configurationForBlastRebaseTokens(token1.target)).to.be.eq(0);
      expect(await factory.isRebaseToken(token1.target)).to.be.eq(false);

      const create2Address = getCreate2Address(
        await poolDeployer.getAddress(),
        [await token0.getAddress(), await token1.getAddress()],
        poolBytecode
      );

      expect(await token0.getConfiguration(create2Address)).to.be.eq(0);
      expect(await token1.getConfiguration(create2Address)).to.be.eq(0);

      await createAndCheckPool([await token0.getAddress(), await token1.getAddress()], true);

      let poolAddress = await factory.poolByPair(await token0.getAddress(), await token1.getAddress());
      expect(await token0.getConfiguration(poolAddress)).to.be.eq(0);
      expect(await token1.getConfiguration(poolAddress)).to.be.eq(0);
    });

    describe('if defaultBlastGovernor is contract, should register gas holder', async () => {
      let BlastGovernorMock: BlastGovernorMock;
      beforeEach(async () => {
        BlastGovernorMock = (await ethers.deployContract('BlastGovernorMock')) as any as BlastGovernorMock;
        await factory.setDefaultBlastGovernor(BlastGovernorMock.target);
      });

      it('register pool address like gas holder', async () => {
        const f = await ethers.getContractFactory('ERC20RebasingMock');
        const token0 = (await f.deploy()) as any as ERC20RebasingMock;
        const token1 = (await f.deploy()) as any as ERC20RebasingMock;

        const create2Address = getCreate2Address(
          await poolDeployer.getAddress(),
          [await token0.getAddress(), await token1.getAddress()],
          poolBytecode
        );

        expect(await BlastGovernorMock.called(factory.target, create2Address)).to.be.false;

        await createAndCheckPool([await token0.getAddress(), await token1.getAddress()], true);

        expect(await BlastGovernorMock.called(factory.target, create2Address)).to.be.true;
      });

      it('register pool plugin address like gas holder', async () => {
        const f = await ethers.getContractFactory('ERC20RebasingMock');
        const token0 = (await f.deploy()) as any as ERC20RebasingMock;
        const token1 = (await f.deploy()) as any as ERC20RebasingMock;

        const create2Address = getCreate2Address(
          await poolDeployer.getAddress(),
          [await token0.getAddress(), await token1.getAddress()],
          poolBytecode
        );
        await createAndCheckPool([await token0.getAddress(), await token1.getAddress()], true);
        let plugin = await ((await ethers.getContractAt('AlgebraPool', create2Address)) as any as AlgebraPool).plugin();
        expect(await BlastGovernorMock.called(factory.target, plugin)).to.be.true;
      });
    });

    describe('with rebasing tokens', async () => {
      it('when token0 isRebaseToken', async () => {
        const f = await ethers.getContractFactory('ERC20RebasingMock');
        const token0 = (await f.deploy()) as any as ERC20RebasingMock;
        const token1 = (await f.deploy()) as any as ERC20RebasingMock;

        await factory.setConfigurationForRebaseToken(token0.target, true, 2);
        expect(await factory.configurationForBlastRebaseTokens(token0.target)).to.be.eq(2);
        expect(await factory.isRebaseToken(token0.target)).to.be.eq(true);

        expect(await factory.configurationForBlastRebaseTokens(token1.target)).to.be.eq(0);
        expect(await factory.isRebaseToken(token1.target)).to.be.eq(false);

        const create2Address = getCreate2Address(
          await poolDeployer.getAddress(),
          [await token0.getAddress(), await token1.getAddress()],
          poolBytecode
        );

        expect(await token0.getConfiguration(create2Address)).to.be.eq(0);
        expect(await token1.getConfiguration(create2Address)).to.be.eq(0);

        await createAndCheckPool([await token0.getAddress(), await token1.getAddress()], true);

        let poolAddress = await factory.poolByPair(await token0.getAddress(), await token1.getAddress());
        expect(await token0.getConfiguration(poolAddress)).to.be.eq(2);
        expect(await token1.getConfiguration(poolAddress)).to.be.eq(0);
      });

      it('when token0 isRebaseToken and setup rebasing token governor', async () => {
        const RebasingTokenGovernorMock = await ethers.deployContract('RebasingTokenGovernorMock');
        await factory.setRebasingTokensGovernor(RebasingTokenGovernorMock.target);

        const f = await ethers.getContractFactory('ERC20RebasingMock');
        const token0 = (await f.deploy()) as any as ERC20RebasingMock;
        const token1 = (await f.deploy()) as any as ERC20RebasingMock;
        await factory.setConfigurationForRebaseToken(token0.target, true, 2);
        expect(await factory.configurationForBlastRebaseTokens(token0.target)).to.be.eq(2);
        expect(await factory.isRebaseToken(token0.target)).to.be.eq(true);

        expect(await factory.configurationForBlastRebaseTokens(token1.target)).to.be.eq(0);
        expect(await factory.isRebaseToken(token1.target)).to.be.eq(false);

        const create2Address = getCreate2Address(
          await poolDeployer.getAddress(),
          [await token0.getAddress(), await token1.getAddress()],
          poolBytecode
        );

        expect(await token0.getConfiguration(create2Address)).to.be.eq(0);
        expect(await token1.getConfiguration(create2Address)).to.be.eq(0);

        expect(await RebasingTokenGovernorMock.called(token0.target, create2Address)).to.be.false;

        await createAndCheckPool([await token0.getAddress(), await token1.getAddress()], true);

        let poolAddress = await factory.poolByPair(await token0.getAddress(), await token1.getAddress());
        expect(await token0.getConfiguration(poolAddress)).to.be.eq(2);
        expect(await token1.getConfiguration(poolAddress)).to.be.eq(0);
        expect(await RebasingTokenGovernorMock.called(token0.target, create2Address)).to.be.true;
      });

      it('when token0 & token1 isRebaseToken', async () => {
        const RebasingTokenGovernorMock = await ethers.deployContract('RebasingTokenGovernorMock');
        await factory.setRebasingTokensGovernor(RebasingTokenGovernorMock.target);

        const f = await ethers.getContractFactory('ERC20RebasingMock');
        const token0 = (await f.deploy()) as any as ERC20RebasingMock;
        const token1 = (await f.deploy()) as any as ERC20RebasingMock;

        await factory.setConfigurationForRebaseToken(token0.target, true, 2);
        await factory.setConfigurationForRebaseToken(token1.target, true, 1);

        expect(await factory.configurationForBlastRebaseTokens(token0.target)).to.be.eq(2);
        expect(await factory.isRebaseToken(token0.target)).to.be.eq(true);

        expect(await factory.configurationForBlastRebaseTokens(token1.target)).to.be.eq(1);
        expect(await factory.isRebaseToken(token1.target)).to.be.eq(true);

        const create2Address = getCreate2Address(
          await poolDeployer.getAddress(),
          [await token0.getAddress(), await token1.getAddress()],
          poolBytecode
        );
        expect(await RebasingTokenGovernorMock.called(token0.target, create2Address)).to.be.false;
        expect(await RebasingTokenGovernorMock.called(token1.target, create2Address)).to.be.false;

        expect(await token0.getConfiguration(create2Address)).to.be.eq(0);
        expect(await token1.getConfiguration(create2Address)).to.be.eq(0);

        await createAndCheckPool([await token0.getAddress(), await token1.getAddress()], true);

        let poolAddress = await factory.poolByPair(await token0.getAddress(), await token1.getAddress());
        expect(await token0.getConfiguration(poolAddress)).to.be.eq(2);
        expect(await token1.getConfiguration(poolAddress)).to.be.eq(1);
        expect(await RebasingTokenGovernorMock.called(token0.target, create2Address)).to.be.true;
        expect(await RebasingTokenGovernorMock.called(token1.target, create2Address)).to.be.true;
      });
    });

    it('fails if trying to create via pool deployer directly', async () => {
      await expect(
        poolDeployer.deploy(
          other.address,
          blastPoints.target,
          blastOperator.address,
          TEST_ADDRESSES[0],
          TEST_ADDRESSES[0],
          TEST_ADDRESSES[0]
        )
      ).to.be.reverted;
    });

    it('fails if token a == token b', async () => {
      await expect(factory.createPool(TEST_ADDRESSES[0], TEST_ADDRESSES[0])).to.be.reverted;
    });

    it('fails if token a is 0 or token b is 0', async () => {
      await expect(factory.createPool(TEST_ADDRESSES[0], ZeroAddress)).to.be.reverted;
      await expect(factory.createPool(ZeroAddress, TEST_ADDRESSES[0])).to.be.reverted;
      expect(factory.createPool(ZeroAddress, ZeroAddress)).to.be.revertedWithoutReason;
    });

    it("fails if isPublicCreationMode disabled and user haven't access role ", async () => {
      await expect(factory.connect(other).createPool(TEST_ADDRESSES[0], TEST_ADDRESSES[1])).to.be.revertedWith(
        `AccessControl: account ${other.address.toLowerCase()} is missing role ${await factory.POOLS_CREATOR_ROLE()}`
      );
      await factory.setIsPublicPoolCreationMode(true);
      await expect(factory.connect(other).createPool(TEST_ADDRESSES[0], TEST_ADDRESSES[1])).to.be.not.reverted;
    });

    it('gas [ @skip-on-coverage ]', async () => {
      await snapshotGasCost(factory.createPool(TEST_ADDRESSES[0], TEST_ADDRESSES[1]));
    });

    it('gas for second pool [ @skip-on-coverage ]', async () => {
      await factory.createPool(TEST_ADDRESSES[0], TEST_ADDRESSES[1]);
      await snapshotGasCost(factory.createPool(TEST_ADDRESSES[0], TEST_ADDRESSES[2]));
    });
  });
  describe('Pool deployer', () => {
    it('cannot set zero address as factory', async () => {
      const poolDeployerFactory = await ethers.getContractFactory('AlgebraPoolDeployer');
      await expect(poolDeployerFactory.deploy(other.address, ZeroAddress)).to.be.reverted;
    });
  });

  describe('#transferOwnership', () => {
    it('fails if caller is not owner', async () => {
      await expect(factory.connect(other).transferOwnership(wallet.address)).to.be.reverted;
      await expect(factory.connect(other).startRenounceOwnership()).to.be.reverted;
      await expect(factory.connect(other).renounceOwnership()).to.be.reverted;
      await expect(factory.connect(other).stopRenounceOwnership()).to.be.reverted;
    });

    it('updates owner', async () => {
      await factory.transferOwnership(other.address);
      await factory.connect(other).acceptOwnership();
      expect(await factory.owner()).to.eq(other.address);
    });

    it('emits event', async () => {
      await factory.transferOwnership(other.address);
      await expect(factory.connect(other).acceptOwnership())
        .to.emit(factory, 'OwnershipTransferred')
        .withArgs(wallet.address, other.address);
    });

    it('cannot be called by original owner', async () => {
      await factory.transferOwnership(other.address);
      await factory.connect(other).acceptOwnership();
      await expect(factory.transferOwnership(wallet.address)).to.be.reverted;
    });

    it('renounceOwner works correct', async () => {
      await factory.startRenounceOwnership();
      await ethers.provider.send('evm_increaseTime', [86500]);
      await factory.renounceOwnership();
      expect(await factory.owner()).to.eq('0x0000000000000000000000000000000000000000');
    });

    it('renounceOwner cannot be used before delay', async () => {
      await factory.startRenounceOwnership();
      await expect(factory.renounceOwnership()).to.be.reverted;
    });

    it('startRenounceOwner cannot be used twice in a row', async () => {
      await factory.startRenounceOwnership();
      await expect(factory.startRenounceOwnership()).to.be.reverted;
    });

    it('stopRenounceOwnership works correct', async () => {
      await factory.startRenounceOwnership();
      await factory.stopRenounceOwnership();
      expect(await factory.renounceOwnershipStartTimestamp()).to.eq(0);
    });

    it('stopRenounceOwnership does not works without start', async () => {
      await expect(factory.stopRenounceOwnership()).to.be.reverted;
    });

    it('stopRenounceOwnership emits event', async () => {
      await factory.startRenounceOwnership();
      await expect(factory.stopRenounceOwnership()).to.emit(factory, 'RenounceOwnershipStop');
    });

    it('renounceOwnership does not works without start', async () => {
      await expect(factory.renounceOwnership()).to.be.reverted;
    });

    it('renounceOwner set owner to zero address', async () => {
      await factory.startRenounceOwnership();
      await time.increase(60 * 60 * 24 * 2);
      await factory.renounceOwnership();
      expect(await factory.owner()).to.be.eq(ZERO_ADDRESS);
    });

    it('renounceOwner set pending to zero address', async () => {
      await factory.transferOwnership(other.address);
      await factory.startRenounceOwnership();
      await time.increase(60 * 60 * 24 * 2);
      await factory.renounceOwnership();
      expect(await factory.owner()).to.be.eq(ZERO_ADDRESS);
      expect(await factory.pendingOwner()).to.be.eq(ZERO_ADDRESS);
    });
  });

  describe('#setDefaultCommunityFee', () => {
    it('fails if caller is not owner', async () => {
      await expect(factory.connect(other).setDefaultCommunityFee(30)).to.be.reverted;
    });

    it('fails if new community fee greater than max fee', async () => {
      await expect(factory.setDefaultCommunityFee(1100)).to.be.reverted;
    });

    it('fails if new community fee eq current', async () => {
      await expect(factory.setDefaultCommunityFee(0)).to.be.reverted;
    });

    it('fails if community vault factory is zero address', async () => {
      await factory.setVaultFactory(ZeroAddress);
      await expect(factory.setDefaultCommunityFee(60)).to.be.reverted;
    });

    it('works correct', async () => {
      await factory.setDefaultCommunityFee(60);
      expect(await factory.defaultCommunityFee()).to.eq(60);
    });

    it('can set to zero', async () => {
      await factory.setDefaultCommunityFee(60);
      await factory.setDefaultCommunityFee(0);
      expect(await factory.defaultCommunityFee()).to.eq(0);
    });

    it('emits event', async () => {
      await expect(factory.setDefaultCommunityFee(60)).to.emit(factory, 'DefaultCommunityFee').withArgs(60);
    });

    it('emits event when changes to zero', async () => {
      await factory.setDefaultCommunityFee(60);
      await expect(factory.setDefaultCommunityFee(0)).to.emit(factory, 'DefaultCommunityFee').withArgs(0);
    });
  });

  describe('#setDefaultFee', () => {
    it('fails if caller is not owner', async () => {
      await expect(factory.connect(other).setDefaultFee(200)).to.be.reverted;
    });

    it('fails if new default fee greater than max fee', async () => {
      await expect(factory.setDefaultFee(51000)).to.be.reverted;
    });

    it('fails if new default fee eq current', async () => {
      const fee = await factory.defaultFee();
      await expect(factory.setDefaultFee(fee)).to.be.reverted;
    });

    it('works correct', async () => {
      await factory.setDefaultFee(60);
      expect(await factory.defaultFee()).to.eq(60);
    });

    it('emits event', async () => {
      await expect(factory.setDefaultFee(60)).to.emit(factory, 'DefaultFee').withArgs(60);
    });
  });

  describe('#setDefaultBlastGovernor', async () => {
    it('fails if try set ZERO_ADDRESS', async () => {
      await expect(factory.setDefaultBlastGovernor(ZERO_ADDRESS)).to.be.reverted;
    });
    it('fails if caller not owner', async () => {
      await expect(factory.connect(other).setDefaultBlastGovernor(other.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
    it('success set new default blast governor address and emit event', async () => {
      expect(await factory.defaultBlastGovernor()).to.be.eq(blastGovernor.address);

      await expect(factory.setDefaultBlastGovernor(other.address))
        .to.be.emit(factory, 'DefaultBlastGovernor')
        .withArgs(other.address);

      expect(await factory.defaultBlastGovernor()).to.be.eq(other.address);
    });
  });

  describe('#setRebasingTokensGovernor', async () => {
    it('fails if caller not owner', async () => {
      await expect(factory.connect(other).setRebasingTokensGovernor(other.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
    it('success set new default rebasing token governor address and emit event', async () => {
      expect(await factory.rebasingTokensGovernor()).to.be.eq(ethers.ZeroAddress);

      await expect(factory.setRebasingTokensGovernor(other.address))
        .to.be.emit(factory, 'SetRebasingTokensGovernor')
        .withArgs(ZERO_ADDRESS, other.address);

      expect(await factory.rebasingTokensGovernor()).to.be.eq(other.address);
    });
  });

  describe('#setDefaultBlastPoints', async () => {
    it('fails if try set ZERO_ADDRESS', async () => {
      await expect(factory.setDefaultBlastPoints(ZERO_ADDRESS)).to.be.reverted;
    });
    it('fails if caller not owner', async () => {
      await expect(factory.connect(other).setDefaultBlastPoints(other.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
    it('success set new default blast points address and emit event', async () => {
      expect(await factory.defaultBlastPoints()).to.be.eq(blastPoints.target);

      await expect(factory.setDefaultBlastPoints(other.address))
        .to.be.emit(factory, 'DefaultBlastPoints')
        .withArgs(other.address);

      expect(await factory.defaultBlastPoints()).to.be.eq(other.address);
    });
  });

  describe('#setDefaultBlastPointsOperator', async () => {
    it('fails if try set ZERO_ADDRESS', async () => {
      await expect(factory.setDefaultBlastPointsOperator(ZERO_ADDRESS)).to.be.reverted;
    });
    it('fails if caller not owner', async () => {
      await expect(factory.connect(other).setDefaultBlastPointsOperator(other.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
    it('success set new default blast points address and emit event', async () => {
      expect(await factory.defaultBlastPointsOperator()).to.be.eq(blastOperator.address);

      await expect(factory.setDefaultBlastPointsOperator(other.address))
        .to.be.emit(factory, 'DefaultBlastPointsOperator')
        .withArgs(other.address);

      expect(await factory.defaultBlastPointsOperator()).to.be.eq(other.address);
    });
  });
  describe('#setConfigurationForRebaseToken', async () => {
    it('fails if caller not owner', async () => {
      await expect(factory.connect(other).setConfigurationForRebaseToken(other.address, true, 1)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
    it('should corect set default rebase configuration for token ', async () => {
      expect(await factory.isRebaseToken(TEST_ADDRESSES[0])).to.be.false;
      expect(await factory.configurationForBlastRebaseTokens(TEST_ADDRESSES[0])).to.be.eq(0);

      await expect(factory.setConfigurationForRebaseToken(TEST_ADDRESSES[0], true, 1))
        .to.be.emit(factory, 'ConfigurationForRebaseToken')
        .withArgs(TEST_ADDRESSES[0], true, 1);

      expect(await factory.isRebaseToken(TEST_ADDRESSES[0])).to.be.true;
      expect(await factory.configurationForBlastRebaseTokens(TEST_ADDRESSES[0])).to.be.eq(1);
    });
  });

  describe('#setDefaultTickspacing', () => {
    it('fails if caller is not owner', async () => {
      await expect(factory.connect(other).setDefaultTickspacing(30)).to.be.reverted;
    });

    it('fails if new default tickspacing greater than max & lt min', async () => {
      await expect(factory.setDefaultTickspacing(1100)).to.be.reverted;
      await expect(factory.setDefaultTickspacing(-1100)).to.be.reverted;
    });

    it('fails if new default tickspacing eq current', async () => {
      await expect(factory.setDefaultTickspacing(60)).to.be.reverted;
    });

    it('works correct', async () => {
      await factory.setDefaultTickspacing(50);
      expect(await factory.defaultTickspacing()).to.eq(50);
    });

    it('emits event', async () => {
      await expect(factory.setDefaultTickspacing(50)).to.emit(factory, 'DefaultTickspacing').withArgs(50);
    });
  });

  describe('#setIsPublicPoolCreationMode', () => {
    it('fails if caller is not owner', async () => {
      await expect(factory.connect(other).setIsPublicPoolCreationMode(false)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
      await factory.transferOwnership(other.address);
      await factory.connect(other).acceptOwnership();

      await expect(factory.connect(other).setIsPublicPoolCreationMode(false)).to.be.not.reverted;
    });

    it('emits event', async () => {
      await expect(factory.setIsPublicPoolCreationMode(true)).to.emit(factory, 'PublicPoolCreationMode').withArgs(true);
      await expect(factory.setIsPublicPoolCreationMode(false))
        .to.emit(factory, 'PublicPoolCreationMode')
        .withArgs(false);
    });
  });

  describe('#setDefaultPluginFactory', () => {
    it('fails if caller is not owner', async () => {
      await expect(factory.connect(other).setDefaultPluginFactory(other.address)).to.be.reverted;
    });

    it('fails if equals current value', async () => {
      await expect(factory.setDefaultPluginFactory(ZeroAddress)).to.be.reverted;
    });

    it('emits event', async () => {
      await expect(factory.setDefaultPluginFactory(other.address))
        .to.emit(factory, 'DefaultPluginFactory')
        .withArgs(other.address);
    });
  });

  describe('#setVaultFactory', () => {
    it('fails if caller is not owner', async () => {
      await expect(factory.connect(other).setVaultFactory(other.address)).to.be.reverted;
    });

    it('fails if equals current value', async () => {
      const vaultFactoryAddress = await factory.vaultFactory();
      await expect(factory.setVaultFactory(vaultFactoryAddress)).to.be.reverted;
    });

    it('fails if tries to set to zero with nonzero default community fee', async () => {
      await factory.setDefaultCommunityFee(60);
      await expect(factory.setVaultFactory(ZeroAddress)).to.be.reverted;
    });

    it('emits event', async () => {
      await expect(factory.setVaultFactory(other.address)).to.emit(factory, 'VaultFactory').withArgs(other.address);
    });
  });

  it('hasRoleOrOwner', async () => {
    expect(
      await factory.hasRoleOrOwner('0x0000000000000000000000000000000000000000000000000000000000000000', wallet.address)
    ).to.eq(true);
    expect(
      await factory.hasRoleOrOwner('0x0000000000000000000000000000000000000000000000000000000000000000', other.address)
    ).to.eq(false);

    await factory.grantRole('0x0000000000000000000000000000000000000000000000000000000000000001', other.address);
    expect(
      await factory.hasRoleOrOwner('0x0000000000000000000000000000000000000000000000000000000000000001', other.address)
    ).to.eq(true);
  });

  it('defaultConfigurationForPool', async () => {
    const { communityFee, tickSpacing, communityVault, fee } = await factory.defaultConfigurationForPool(ZeroAddress);
    expect(communityFee).to.eq(0);
    expect(tickSpacing).to.eq(60);
    expect(communityVault).to.not.eq(ZeroAddress);
    expect(fee).to.eq(500);
  });

  it('defaultConfigurationForPool works without vault factory', async () => {
    await factory.setVaultFactory(ZeroAddress);
    const { communityFee, tickSpacing, communityVault, fee } = await factory.defaultConfigurationForPool(ZeroAddress);
    expect(communityFee).to.eq(0);
    expect(tickSpacing).to.eq(60);
    expect(communityVault).to.eq(ZeroAddress);
    expect(fee).to.eq(500);
  });
});
