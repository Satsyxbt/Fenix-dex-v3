import { Wallet, getCreateAddress, ZeroAddress, keccak256 } from 'ethers';
import { ethers } from 'hardhat';
import { loadFixture, setBalance, takeSnapshot } from '@nomicfoundation/hardhat-network-helpers';
import {
  AlgebraFactory,
  AlgebraPool,
  AlgebraPoolDeployer,
  AlgebraVaultFactoryStub,
  BlastPointsMock,
  IBlastNearMock,
  IERC20RebasingMock,
  MockDefaultPluginFactory,
  TestAlgebraCallee,
} from '../typechain';
import { expect } from './shared/expect';
import {
  BLAST_POINTS_ADDRESS,
  BLAST_PREDEPLOYED_ADDRESS,
  USDB_PREDEPLOYED_ADDRESS,
  WETH_PREDEPLOYED_ADDRESS,
  encodePriceSqrt,
} from './shared/utilities';
import SnapshotManager from 'mocha-chai-jest-snapshot/dist/manager';
import { SnapshotRestorer } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { ZERO_ADDRESS } from './shared/fixtures';

describe('BlastFork specific tests', () => {
  if (process.env.BLAST_FORK === 'true') {
    const USDB_HOLDER = '0xF9950E55323aC6Af7a4b2DCEe5e42d5168CdA253';
    let wallet: Wallet, other: Wallet, blastGovernor: Wallet;

    let blast: IBlastNearMock;
    let blastPointsMock: BlastPointsMock;
    let usdb: IERC20RebasingMock;
    let weth: IERC20RebasingMock;
    let factory: AlgebraFactory;
    let poolDeployer: AlgebraPoolDeployer;
    let defaultPluginFactory: MockDefaultPluginFactory;
    let vaultFactoryStub: AlgebraVaultFactoryStub;
    let snapshot: SnapshotRestorer;

    const fixture = async () => {
      const [deployer, governor] = await ethers.getSigners();
      // precompute
      const poolDeployerAddress = getCreateAddress({
        from: deployer.address,
        nonce: (await ethers.provider.getTransactionCount(deployer.address)) + 1,
      });

      const factoryFactory = await ethers.getContractFactory('AlgebraFactory');
      const factory = (await factoryFactory.deploy(governor.address, poolDeployerAddress)) as any as AlgebraFactory;

      const poolDeployerFactory = await ethers.getContractFactory('AlgebraPoolDeployer');
      const poolDeployer = (await poolDeployerFactory.deploy(governor.address, factory)) as any as AlgebraPoolDeployer;

      const vaultFactory = await ethers.getContractFactory('AlgebraCommunityVault');
      const vault = await vaultFactory.deploy(governor.address, factory, deployer.address);

      const vaultFactoryStubFactory = await ethers.getContractFactory('AlgebraVaultFactoryStub');
      const vaultFactoryStub = (await vaultFactoryStubFactory.deploy(
        governor.address,
        vault
      )) as any as AlgebraVaultFactoryStub;

      await factory.setVaultFactory(vaultFactoryStub);

      const defaultPluginFactoryFactory = await ethers.getContractFactory('MockDefaultPluginFactory');
      const defaultPluginFactory = (await defaultPluginFactoryFactory.deploy()) as any as MockDefaultPluginFactory;

      return { factory, poolDeployer, defaultPluginFactory, vaultFactoryStub };
    };

    before('create fixture loader', async () => {
      [wallet, blastGovernor, other] = await (ethers as any).getSigners();
      ({ factory, poolDeployer, defaultPluginFactory, vaultFactoryStub } = await loadFixture(fixture));
      blast = (await ethers.getContractAt('IBlastNearMock', BLAST_PREDEPLOYED_ADDRESS)) as any as IBlastNearMock;
      usdb = (await ethers.getContractAt('IERC20RebasingMock', USDB_PREDEPLOYED_ADDRESS)) as any as IERC20RebasingMock;
      weth = (await ethers.getContractAt('IERC20RebasingMock', WETH_PREDEPLOYED_ADDRESS)) as any as IERC20RebasingMock;
      blastPointsMock = (await ethers.getContractAt('BlastPointsMock', BLAST_POINTS_ADDRESS)) as any as BlastPointsMock;
      snapshot = await takeSnapshot();
    });

    afterEach(async () => {
      await snapshot.restore();
    });

    it('Correct initialize blast governor for core contracts', async () => {
      expect(await blast.governorMap(factory.target)).to.be.eq(blastGovernor.address);
      expect(await blast.governorMap(poolDeployer.target)).to.be.eq(blastGovernor.address);
      expect(await blast.governorMap(vaultFactoryStub.target)).to.be.eq(blastGovernor.address);
    });

    it('Correct initialize blast governor and blast points operator for created pool', async () => {
      await factory.createPool(usdb.target, weth.target);

      let pool = (await ethers.getContractAt(
        'AlgebraPool',
        await factory.poolByPair(usdb.target, weth.target)
      )) as any as AlgebraPool;

      expect(await blast.governorMap(pool.target)).to.be.eq(blastGovernor.address);

      expect(await blastPointsMock.operatorMap(pool.target)).to.be.eq(blastGovernor.address);
    });

    it('Correct initialize blast governor and blastPoins operator for created pool after changed default blast governor', async () => {
      expect(await factory.defaultBlastGovernor()).to.be.eq(blastGovernor.address);
      await factory.setDefaultBlastGovernor(other.address);
      expect(await factory.defaultBlastGovernor()).to.be.eq(other.address);
      await factory.createPool(usdb.target, weth.target);
      let pool = (await ethers.getContractAt(
        'AlgebraPool',
        await factory.poolByPair(usdb.target, weth.target)
      )) as any as AlgebraPool;
      expect(await blast.governorMap(pool.target)).to.be.eq(other.address);
      expect(await blastPointsMock.operatorMap(pool.target)).to.be.eq(other.address);
    });
    it('Provide points operator oportunity to configure blast points operator', async () => {
      await factory.createPool(usdb.target, weth.target);
      let pool = (await ethers.getContractAt(
        'AlgebraPool',
        await factory.poolByPair(usdb.target, weth.target)
      )) as any as AlgebraPool;

      expect(await blastPointsMock.operatorMap(pool.target)).to.be.eq(blastGovernor.address);

      await blastPointsMock.configurePointsOperatorOnBehalf(pool.target, other.address);

      expect(await blastPointsMock.operatorMap(pool.target)).to.be.eq(other.address);
    });
    it('Provider blastGovernor oportunity to configure gas mode', async () => {
      let getGasInfo = await blast.readGasParams(factory.target);
      expect(getGasInfo[3]).to.be.eq(0);
      await blast.connect(blastGovernor).configureClaimableGasOnBehalf(factory.target);
      getGasInfo = await blast.readGasParams(factory.target);
      expect(getGasInfo[3]).to.be.eq(1);

      getGasInfo = await blast.readGasParams(poolDeployer.target);
      expect(getGasInfo[3]).to.be.eq(0);
      await blast.connect(blastGovernor).configureClaimableGasOnBehalf(poolDeployer.target);
      getGasInfo = await blast.readGasParams(poolDeployer.target);
      expect(getGasInfo[3]).to.be.eq(1);

      getGasInfo = await blast.readGasParams(vaultFactoryStub.target);
      expect(getGasInfo[3]).to.be.eq(0);

      await blast.connect(blastGovernor).configureClaimableGasOnBehalf(vaultFactoryStub.target);

      getGasInfo = await blast.readGasParams(vaultFactoryStub.target);
      expect(getGasInfo[3]).to.be.eq(1);

      await factory.createPool(usdb.target, weth.target);
      let pool = (await ethers.getContractAt(
        'AlgebraPool',
        await factory.poolByPair(usdb.target, weth.target)
      )) as any as AlgebraPool;

      getGasInfo = await blast.readGasParams(pool.target);
      expect(getGasInfo[3]).to.be.eq(0);

      await blast.connect(blastGovernor).configureClaimableGasOnBehalf(pool.target);

      getGasInfo = await blast.readGasParams(pool.target);
      expect(getGasInfo[3]).to.be.eq(1);
    });

    describe('Configuration rebasing tokens in pool', async () => {
      it('Factory administator can oportunity to configure ERC20Rebasing tokens', async () => {
        await factory.createPool(usdb.target, weth.target);
        let pool = (await ethers.getContractAt(
          'AlgebraPool',
          await factory.poolByPair(usdb.target, weth.target)
        )) as any as AlgebraPool;
        await pool.configure(USDB_PREDEPLOYED_ADDRESS, 1);
        await pool.configure(WETH_PREDEPLOYED_ADDRESS, 1);
      });

      it('Factory administator can oportunity to claim ERC20Rebasing tokens', async () => {
        await factory.createPool(usdb.target, weth.target);
        let pool = (await ethers.getContractAt(
          'AlgebraPool',
          await factory.poolByPair(usdb.target, weth.target)
        )) as any as AlgebraPool;

        expect(await ethers.provider.getBalance(pool.target)).to.be.eq(ZERO_ADDRESS);

        await wallet.sendTransaction({ to: weth.target, value: ethers.parseEther('1') });
        await weth.transfer(pool.target, ethers.parseEther('1'));

        expect(await weth.balanceOf(pool.target)).to.be.eq(ethers.parseEther('1'));

        await pool.configure(WETH_PREDEPLOYED_ADDRESS, 2);

        expect(await weth.getClaimableAmount(pool.target)).to.be.eq(0);

        let balance = await ethers.provider.getBalance(weth.target);
        await setBalance(await weth.getAddress(), balance + balance);

        expect(await weth.balanceOf(pool.target)).to.be.eq(ethers.parseEther('1'));

        expect(await weth.getClaimableAmount(pool.target)).to.be.closeTo(
          ethers.parseEther('1'),
          ethers.parseEther('0.00001')
        );
        await pool.claim(
          WETH_PREDEPLOYED_ADDRESS,
          '0x1110000000000000000000000000000000000000',
          await weth.getClaimableAmount(pool.target)
        );
        expect(await weth.balanceOf(pool.target)).to.be.eq(ethers.parseEther('1'));
        expect(await weth.getClaimableAmount(pool.target)).to.be.eq(0);
        expect(await weth.balanceOf('0x1110000000000000000000000000000000000000')).to.be.greaterThan(
          ethers.parseEther('1')
        );
      });
    });
    it.skip('create pool and test work with rebasing tokens', async () => {
      await factory.createPool(usdb.target, weth.target);
      let pool = (await ethers.getContractAt(
        'AlgebraPool',
        await factory.poolByPair(usdb.target, weth.target)
      )) as any as AlgebraPool;

      await pool.initialize(encodePriceSqrt(1, 1));

      let topHolder = await ethers.getImpersonatedSigner(USDB_HOLDER); // top holder usdb;
      console.log('await usdb.balanceOf(wallet.target)', await usdb.balanceOf(wallet.address));
      console.log('await weth.balanceOf(wallet.target)', await weth.balanceOf(wallet.address));

      console.log(await ethers.provider.getBalance(topHolder.address));
      console.log(await ethers.provider.getBalance(wallet.address));

      await wallet.sendTransaction({ to: topHolder.address, value: ethers.parseEther('100') });
      console.log(await ethers.provider.getBalance(wallet.address));

      console.log(await ethers.provider.getBalance(topHolder.address));
      await usdb.connect(topHolder).transfer(wallet.address, ethers.parseEther('100'));
      await wallet.sendTransaction({ to: weth.target, value: ethers.parseEther('100') });

      await usdb.connect(topHolder).transfer(other.address, ethers.parseEther('100'));
      await other.sendTransaction({ to: weth.target, value: ethers.parseEther('100') });

      let caller = (await ethers.deployContract('TestAlgebraCallee')) as any as TestAlgebraCallee;

      await usdb.transfer(pool.target, ethers.parseEther('1'));
      await weth.transfer(pool.target, ethers.parseEther('1'));
      await usdb.approve(caller.target, ethers.parseEther('0.02'));
      await weth.approve(caller.target, ethers.parseEther('0.02'));
      await usdb.connect(other).approve(caller.target, ethers.parseEther('0.02'));
      await weth.connect(other).approve(caller.target, ethers.parseEther('0.02'));

      console.log('pool', await pool.liquidity());
      await caller.mint(pool.target, wallet.address, -60, 60, ethers.parseEther('1'));
      console.log('After mint first');
      console.log('pool', await pool.liquidity());
      console.log('await usdb.balanceOf(pool.target)', ethers.formatEther(await usdb.balanceOf(pool.target)));
      console.log('await weth.balanceOf(pool.target)', ethers.formatEther(await weth.balanceOf(pool.target)));
      console.log('await usdb.balanceOf(wallet.target)', ethers.formatEther(await usdb.balanceOf(wallet.address)));
      console.log('await weth.balanceOf(wallet.target)', ethers.formatEther(await weth.balanceOf(wallet.address)));
      console.log('await usdb.balanceOf(other.target)', ethers.formatEther(await usdb.balanceOf(other.address)));
      console.log('await weth.balanceOf(other.target)', ethers.formatEther(await weth.balanceOf(other.address)));

      let balance = await ethers.provider.getBalance(weth.target);
      await setBalance(await weth.getAddress(), balance + balance);
      console.log('After Rebasing');
      console.log('pool', await pool.liquidity());
      console.log('await usdb.balanceOf(pool.target)', ethers.formatEther(await usdb.balanceOf(pool.target)));
      console.log('await weth.balanceOf(pool.target)', ethers.formatEther(await weth.balanceOf(pool.target)));
      console.log('await usdb.balanceOf(wallet.target)', ethers.formatEther(await usdb.balanceOf(wallet.address)));
      console.log('await weth.balanceOf(wallet.target)', ethers.formatEther(await weth.balanceOf(wallet.address)));
      console.log('await usdb.balanceOf(other.target)', ethers.formatEther(await usdb.balanceOf(other.address)));
      console.log('await weth.balanceOf(other.target)', ethers.formatEther(await weth.balanceOf(other.address)));

      console.log('After mint other');
      await usdb.connect(other).transfer(pool.target, ethers.parseEther('1'));
      await weth.connect(other).transfer(pool.target, ethers.parseEther('1'));
      await caller.connect(other).mint(pool.target, other.address, -60, 60, ethers.parseEther('1'));
      console.log('pool', await pool.liquidity());
      console.log('await usdb.balanceOf(pool.target)', ethers.formatEther(await usdb.balanceOf(pool.target)));
      console.log('await weth.balanceOf(pool.target)', ethers.formatEther(await weth.balanceOf(pool.target)));
      console.log('await usdb.balanceOf(wallet.target)', ethers.formatEther(await usdb.balanceOf(wallet.address)));
      console.log('await weth.balanceOf(wallet.target)', ethers.formatEther(await weth.balanceOf(wallet.address)));
      console.log('await usdb.balanceOf(other.target)', ethers.formatEther(await usdb.balanceOf(other.address)));
      console.log('await weth.balanceOf(other.target)', ethers.formatEther(await weth.balanceOf(other.address)));
      balance = await ethers.provider.getBalance(weth.target);
      await setBalance(await weth.getAddress(), balance + balance);

      console.log('After Rebasing');
      console.log('await usdb.balanceOf(pool.target)', ethers.formatEther(await usdb.balanceOf(pool.target)));
      console.log('await weth.balanceOf(pool.target)', ethers.formatEther(await weth.balanceOf(pool.target)));
      console.log('await usdb.balanceOf(wallet.target)', ethers.formatEther(await usdb.balanceOf(wallet.address)));
      console.log('await weth.balanceOf(wallet.target)', ethers.formatEther(await weth.balanceOf(wallet.address)));
      console.log('await usdb.balanceOf(other.target)', ethers.formatEther(await usdb.balanceOf(other.address)));
      console.log('await weth.balanceOf(other.target)', ethers.formatEther(await weth.balanceOf(other.address)));

      console.log('Burn, other');

      await pool.connect(other).burn(-60, 60, ethers.parseEther('1'), '0x');
      console.log('await usdb.balanceOf(pool.target)', ethers.formatEther(await usdb.balanceOf(pool.target)));

      await pool.connect(other).collect(other.address, -60, 60, ethers.parseEther('1000'), ethers.parseEther('1000'));
      console.log('pool', await pool.liquidity());
      console.log('await usdb.balanceOf(pool.target)', ethers.formatEther(await usdb.balanceOf(pool.target)));
      console.log('await weth.balanceOf(pool.target)', ethers.formatEther(await weth.balanceOf(pool.target)));
      console.log('await usdb.balanceOf(wallet.target)', ethers.formatEther(await usdb.balanceOf(wallet.address)));
      console.log('await weth.balanceOf(wallet.target)', ethers.formatEther(await weth.balanceOf(wallet.address)));
      console.log('await usdb.balanceOf(other.target)', ethers.formatEther(await usdb.balanceOf(other.address)));
      console.log('await weth.balanceOf(other.target)', ethers.formatEther(await weth.balanceOf(other.address)));

      console.log('Burn after burn firest');
      await pool.burn(-60, 60, ethers.parseEther('1'), '0x');
      await pool.collect(wallet.address, -60, 60, ethers.parseEther('1000'), ethers.parseEther('1000'));
      console.log('pool', await pool.liquidity());
      console.log('await usdb.balanceOf(pool.target)', ethers.formatEther(await usdb.balanceOf(pool.target)));
      console.log('await weth.balanceOf(pool.target)', ethers.formatEther(await weth.balanceOf(pool.target)));
      console.log('await usdb.balanceOf(wallet.target)', ethers.formatEther(await usdb.balanceOf(wallet.address)));
      console.log('await weth.balanceOf(wallet.target)', ethers.formatEther(await weth.balanceOf(wallet.address)));
      console.log('await usdb.balanceOf(other.target)', ethers.formatEther(await usdb.balanceOf(other.address)));
      console.log('await weth.balanceOf(other.target)', ethers.formatEther(await weth.balanceOf(other.address)));
    });
  } else {
    it('skip for not BLAST_FORK', async () => {});
  }
});
