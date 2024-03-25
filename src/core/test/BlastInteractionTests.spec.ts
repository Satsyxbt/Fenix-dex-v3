import { ethers } from 'hardhat';
import { expect } from './shared/expect';
import { ZERO_ADDRESS, mockBlastPart } from './shared/fixtures';
import { BlastPointsMock } from '../typechain';
import { Wallet, getCreateAddress, ZeroAddress, keccak256 } from 'ethers';

describe('BlastInteractionTest', () => {
  let blastPoints: BlastPointsMock;
  let blastGovernor: Wallet;
  let blastOperator: Wallet;

  before(async () => {
    blastPoints = await mockBlastPart();
    [blastGovernor, blastOperator] = await (ethers as any).getSigners();
  });

  it('fail if create with invalid blast governor address', async () => {
    const factoryFactory = await ethers.getContractFactory('BlastGovernorSetupMock');
    await expect(factoryFactory.deploy(ZERO_ADDRESS)).to.be.revertedWithCustomError(factoryFactory, 'AddressZero');
  });

  describe('#BlastERC20RebasingManageMock', async () => {
    it('fail if call __BlastERC20RebasingManage__init with zero blast governor', async () => {
      const factory = await ethers.getContractFactory('BlastERC20RebasingManageMock');
      await expect(
        factory.deploy(ZERO_ADDRESS, blastPoints.target, blastOperator.address)
      ).to.be.revertedWithCustomError(factory, 'AddressZero');
    });
    it('fail if call __BlastERC20RebasingManage__init with zero blast points', async () => {
      const factory = await ethers.getContractFactory('BlastERC20RebasingManageMock');
      await expect(
        factory.deploy(blastGovernor.address, ZERO_ADDRESS, blastOperator.address)
      ).to.be.revertedWithCustomError(factory, 'AddressZero');
    });
    it('fail if call __BlastERC20RebasingManage__init with zero blast points operator', async () => {
      const factory = await ethers.getContractFactory('BlastERC20RebasingManageMock');
      await expect(
        factory.deploy(blastGovernor.address, blastPoints.target, ZERO_ADDRESS)
      ).to.be.revertedWithCustomError(factory, 'AddressZero');
    });

    it('success setup blast poins operator for contract', async () => {
      const factory = await ethers.getContractFactory('BlastERC20RebasingManageMock');

      let instance = await factory.deploy(blastGovernor.address, blastPoints.target, blastOperator.address);
      expect(await blastPoints.operatorMap(instance.target)).to.be.eq(blastOperator.address);

      let instance2 = await factory.deploy(blastGovernor.address, blastPoints.target, blastGovernor.address);
      expect(await blastPoints.operatorMap(instance2.target)).to.be.eq(blastGovernor.address);
    });
  });
  it('corect calls to ERC20Rebasing methods', async () => {
    const mock = await (
      await ethers.getContractFactory('BlastERC20RebasingManageMock')
    ).deploy(blastGovernor.address, blastPoints.target, blastOperator.address);
    const erc20Rebasing = await (await ethers.getContractFactory('ERC20RebasingMock')).deploy();
    expect(await erc20Rebasing.getConfiguration(mock.target)).to.be.eq(0);

    await mock.configure(erc20Rebasing.target, 1);

    expect(await erc20Rebasing.getConfiguration(mock.target)).to.be.eq(1);

    await mock.configure(erc20Rebasing.target, 2);

    expect(await erc20Rebasing.getConfiguration(mock.target)).to.be.eq(2);

    await mock.configure(erc20Rebasing.target, 0);

    expect(await erc20Rebasing.getConfiguration(mock.target)).to.be.eq(0);

    expect(await mock.claim.staticCall(erc20Rebasing.target, mock.target, ethers.parseEther('1'))).to.be.eq(
      ethers.parseEther('1')
    );
  });
});
