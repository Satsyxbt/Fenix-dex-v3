import { ethers } from 'hardhat';
import { expect } from './shared/expect';
import { ZERO_ADDRESS, mockBlastPart } from './shared/fixtures';

describe('BlastInteractionTest', () => {
  before(async () => {
    await mockBlastPart();
  });

  it('fail if create with invalid blast governor address', async () => {
    const factoryFactory = await ethers.getContractFactory('BlastGovernorSetupMock');
    await expect(factoryFactory.deploy(ZERO_ADDRESS)).to.be.revertedWithCustomError(factoryFactory, 'AddressZero');
  });

  it('corect calls to ERC20Rebasing methods', async () => {
    const mock = await (await ethers.getContractFactory('BlastERC20RebasingManageMock')).deploy();
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
