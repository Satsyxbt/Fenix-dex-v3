import { Wallet } from 'ethers';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from './shared/expect';
import { ZERO_ADDRESS, pluginFactoryFixture } from './shared/fixtures';

import { BasePluginV1Factory, AlgebraBasePluginV1, MockFactory } from '../typechain';

describe('BasePluginV1Factory', () => {
  let wallet: Wallet, other: Wallet, blastGovernor: Wallet;

  let pluginFactory: BasePluginV1Factory;
  let mockAlgebraFactory: MockFactory;

  before('prepare signers', async () => {
    [wallet, blastGovernor, other] = await (ethers as any).getSigners();
  });

  beforeEach('deploy test volatilityOracle', async () => {
    ({ pluginFactory, mockFactory: mockAlgebraFactory } = await loadFixture(pluginFactoryFixture));
  });

  describe('#Create plugin', () => {
    it('only factory', async () => {
      expect(pluginFactory.createPlugin(wallet.address, ZERO_ADDRESS, ZERO_ADDRESS)).to.be.revertedWithoutReason;
    });

    it('factory can create plugin', async () => {
      const pluginFactory = await ethers.getContractFactory('AlgebraBasePluginV1');
      const pluginImplementation = await pluginFactory.deploy();

      const pluginFactoryFactory = await ethers.getContractFactory('BasePluginV1Factory');
      const pluginFactoryMock = (await pluginFactoryFactory.deploy(
        blastGovernor.address,
        wallet.address,
        pluginImplementation.target
      )) as any as BasePluginV1Factory;

      const pluginAddress = await pluginFactoryMock.createPlugin.staticCall(wallet.address, ZERO_ADDRESS, ZERO_ADDRESS);
      await pluginFactoryMock.createPlugin(wallet.address, ZERO_ADDRESS, ZERO_ADDRESS);

      const pluginMock = pluginFactory.attach(pluginAddress) as any as AlgebraBasePluginV1;
      const feeConfig = await pluginMock.feeConfig();
      expect(feeConfig.baseFee).to.be.not.eq(0);
    });
  });

  describe('#CreatePluginForExistingPool', () => {
    it('only if has role', async () => {
      expect(pluginFactory.connect(other).createPluginForExistingPool(wallet.address, other.address)).to.be.revertedWithoutReason;
    });

    it('cannot create for nonexistent pool', async () => {
      await expect(pluginFactory.createPluginForExistingPool(wallet.address, other.address)).to.be.revertedWith('Pool not exist');
    });

    it('can create for existing pool', async () => {
      await mockAlgebraFactory.stubPool(wallet.address, other.address, other.address);

      await pluginFactory.createPluginForExistingPool(wallet.address, other.address);
      const pluginAddress = await pluginFactory.pluginByPool(other.address);
      expect(pluginAddress).to.not.be.eq(ZERO_ADDRESS);
      const pluginMock = (await ethers.getContractFactory('AlgebraBasePluginV1')).attach(pluginAddress) as any as AlgebraBasePluginV1;
      const feeConfig = await pluginMock.feeConfig();
      expect(feeConfig.baseFee).to.be.not.eq(0);
    });

    it('cannot create twice for existing pool', async () => {
      await mockAlgebraFactory.stubPool(wallet.address, other.address, other.address);

      await pluginFactory.createPluginForExistingPool(wallet.address, other.address);

      await expect(pluginFactory.createPluginForExistingPool(wallet.address, other.address)).to.be.revertedWith('Already created');
    });
  });

  describe('#Default fee configuration', () => {
    describe('#setDefaultFeeConfiguration', () => {
      const configuration = {
        alpha1: 3002,
        alpha2: 10009,
        beta1: 1001,
        beta2: 1006,
        gamma1: 20,
        gamma2: 22,
        baseFee: 150,
      };
      it('fails if caller is not owner', async () => {
        await expect(pluginFactory.connect(other).setDefaultFeeConfiguration(configuration)).to.be.revertedWith('Only administrator');
      });

      it('updates defaultFeeConfiguration', async () => {
        await pluginFactory.setDefaultFeeConfiguration(configuration);

        const newConfig = await pluginFactory.defaultFeeConfiguration();

        expect(newConfig.alpha1).to.eq(configuration.alpha1);
        expect(newConfig.alpha2).to.eq(configuration.alpha2);
        expect(newConfig.beta1).to.eq(configuration.beta1);
        expect(newConfig.beta2).to.eq(configuration.beta2);
        expect(newConfig.gamma1).to.eq(configuration.gamma1);
        expect(newConfig.gamma2).to.eq(configuration.gamma2);
        expect(newConfig.baseFee).to.eq(configuration.baseFee);
      });

      it('emits event', async () => {
        await expect(pluginFactory.setDefaultFeeConfiguration(configuration))
          .to.emit(pluginFactory, 'DefaultFeeConfiguration')
          .withArgs([
            configuration.alpha1,
            configuration.alpha2,
            configuration.beta1,
            configuration.beta2,
            configuration.gamma1,
            configuration.gamma2,
            configuration.baseFee,
          ]);
      });

      it('cannot exceed max fee', async () => {
        const conf2 = { ...configuration };
        conf2.alpha1 = 30000;
        conf2.alpha2 = 30000;
        conf2.baseFee = 15000;
        await expect(pluginFactory.setDefaultFeeConfiguration(conf2)).to.be.revertedWith('Max fee exceeded');
      });

      it('cannot set zero gamma', async () => {
        let conf2 = { ...configuration };
        conf2.gamma1 = 0;
        await expect(pluginFactory.setDefaultFeeConfiguration(conf2)).to.be.revertedWith('Gammas must be > 0');

        conf2 = { ...configuration };
        conf2.gamma2 = 0;
        await expect(pluginFactory.setDefaultFeeConfiguration(conf2)).to.be.revertedWith('Gammas must be > 0');

        conf2 = { ...configuration };
        conf2.gamma1 = 0;
        conf2.gamma2 = 0;
        await expect(pluginFactory.setDefaultFeeConfiguration(conf2)).to.be.revertedWith('Gammas must be > 0');
      });
    });
  });

  describe('#setFarmingAddress', () => {
    it('fails if caller is not owner', async () => {
      await expect(pluginFactory.connect(other).setFarmingAddress(wallet.address)).to.be.revertedWith('Only administrator');
    });

    it('updates farmingAddress', async () => {
      await pluginFactory.setFarmingAddress(other.address);
      expect(await pluginFactory.farmingAddress()).to.eq(other.address);
    });

    it('emits event', async () => {
      await expect(pluginFactory.setFarmingAddress(other.address)).to.emit(pluginFactory, 'FarmingAddress').withArgs(other.address);
    });

    it('cannot set current address', async () => {
      await pluginFactory.setFarmingAddress(other.address);
      await expect(pluginFactory.setFarmingAddress(other.address)).to.be.reverted;
    });
  });

  describe('#setDefaultBlastGovernor', async () => {
    it('fails if caller not owner', async () => {
      await expect(pluginFactory.connect(other).setDefaultBlastGovernor(other.address)).to.be.revertedWith('Only administrator');
    });
    it('success set new default blast governor address and emit event', async () => {
      expect(await pluginFactory.defaultBlastGovernor()).to.be.eq(blastGovernor.address);

      await expect(pluginFactory.setDefaultBlastGovernor(other.address)).to.be.emit(pluginFactory, 'DefaultBlastGovernor').withArgs(other.address);

      expect(await pluginFactory.defaultBlastGovernor()).to.be.eq(other.address);
    });
  });
  describe('#upgradeTo', () => {
    it('fails if caller is not administator', async () => {
      await expect(pluginFactory.connect(other).upgradeTo(wallet.address)).to.be.revertedWith('Only administrator');
    });

    it('fails if new implementation is not contract', async () => {
      await expect(pluginFactory.upgradeTo(wallet.address))
        .to.be.revertedWithCustomError(pluginFactory, 'BeaconInvalidImplementation')
        .withArgs(wallet.address);
    });

    it('upgrade current plugins implementation', async () => {
      await mockAlgebraFactory.stubPool(wallet.address, other.address, other.address);

      await pluginFactory.createPluginForExistingPool(wallet.address, other.address);
      const pluginAddress = await pluginFactory.pluginByPool(other.address);

      const basePluginFactory = await ethers.getContractFactory('MockTimeAlgebraBasePluginV1');
      const newImplementation = await basePluginFactory.deploy();

      await expect(basePluginFactory.attach(pluginAddress).version()).to.be.reverted;

      expect(await pluginFactory.implementation()).to.be.not.eq(newImplementation.target);
      await pluginFactory.upgradeTo(newImplementation.target);
      expect(await pluginFactory.implementation()).to.eq(newImplementation.target);

      expect(await basePluginFactory.attach(pluginAddress).version()).to.be.equal('MockTimeAlgebraBasePluginV1');
    });

    it('emits event', async () => {
      const basePluginFactory = await ethers.getContractFactory('AlgebraBasePluginV1');
      const pluginImplementation = await basePluginFactory.deploy();
      await expect(pluginFactory.upgradeTo(pluginImplementation.target)).to.emit(pluginFactory, 'Upgraded').withArgs(pluginImplementation.target);
    });
  });
});
