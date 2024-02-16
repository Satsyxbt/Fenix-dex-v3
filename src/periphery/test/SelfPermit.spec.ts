import { Wallet, MaxUint256 } from 'ethers';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

import { SelfPermitTest, TestERC20PermitAllowed } from '../typechain';
import { expect } from 'chai';
import { getPermitSignature } from './shared/permit';

describe('SelfPermit', () => {
  let wallet: Wallet;
  let other: Wallet;

  const fixture: () => Promise<{
    token: TestERC20PermitAllowed;
    selfPermitTest: SelfPermitTest;
  }> = async () => {
    const tokenFactory = await ethers.getContractFactory('TestERC20PermitAllowed');
    const token = (await tokenFactory.deploy(0)) as any as TestERC20PermitAllowed;

    const selfPermitTestFactory = await ethers.getContractFactory('SelfPermitTest');
    const selfPermitTest = (await selfPermitTestFactory.deploy()) as any as SelfPermitTest;

    return {
      token,
      selfPermitTest,
    };
  };

  let token: TestERC20PermitAllowed;
  let selfPermitTest: SelfPermitTest;

  before('create fixture loader', async () => {
    const wallets = await (ethers as any).getSigners();
    [wallet, other] = wallets;
  });

  beforeEach('load fixture', async () => {
    ({ token, selfPermitTest } = await loadFixture(fixture));
  });

  it('#permit', async () => {
    const value = 123;

    const { v, r, s } = await getPermitSignature(wallet, token, other.address, value);

    expect(await token.allowance(wallet.address, other.address)).to.be.eq(0);
    await token['permit(address,address,uint256,uint256,uint8,bytes32,bytes32)'](
      wallet.address,
      other.address,
      value,
      MaxUint256,
      v,
      r,
      s
    );
    expect(await token.allowance(wallet.address, other.address)).to.be.eq(value);
  });

  describe('#selfPermit', () => {
    const value = 456;

    it('works', async () => {
      const { v, r, s } = await getPermitSignature(wallet, token, await selfPermitTest.getAddress(), value);

      expect(await token.allowance(wallet.address, await selfPermitTest.getAddress())).to.be.eq(0);
      await selfPermitTest.selfPermit(await token.getAddress(), value, MaxUint256, v, r, s);
      expect(await token.allowance(wallet.address, await selfPermitTest.getAddress())).to.be.eq(value);
    });

    it('fails if permit is submitted externally', async () => {
      const { v, r, s } = await getPermitSignature(wallet, token, await selfPermitTest.getAddress(), value);

      expect(await token.allowance(wallet.address, await selfPermitTest.getAddress())).to.be.eq(0);
      await token['permit(address,address,uint256,uint256,uint8,bytes32,bytes32)'](
        wallet.address,
        await selfPermitTest.getAddress(),
        value,
        MaxUint256,
        v,
        r,
        s
      );
      expect(await token.allowance(wallet.address, await selfPermitTest.getAddress())).to.be.eq(value);

      await expect(selfPermitTest.selfPermit(await token.getAddress(), value, MaxUint256, v, r, s)).to.be.revertedWith(
        'ERC20Permit: invalid signature'
      );
    });
  });

  describe('#selfPermitIfNecessary', () => {
    const value = 789;

    it('works', async () => {
      const { v, r, s } = await getPermitSignature(wallet, token, await selfPermitTest.getAddress(), value);

      expect(await token.allowance(wallet.address, await selfPermitTest.getAddress())).to.be.eq(0);
      await selfPermitTest.selfPermitIfNecessary(await token.getAddress(), value, MaxUint256, v, r, s);
      expect(await token.allowance(wallet.address, await selfPermitTest.getAddress())).to.be.eq(value);
    });

    it('does not fail if permit is submitted externally', async () => {
      const { v, r, s } = await getPermitSignature(wallet, token, await selfPermitTest.getAddress(), value);

      expect(await token.allowance(wallet.address, await selfPermitTest.getAddress())).to.be.eq(0);
      await token['permit(address,address,uint256,uint256,uint8,bytes32,bytes32)'](
        wallet.address,
        await selfPermitTest.getAddress(),
        value,
        MaxUint256,
        v,
        r,
        s
      );
      expect(await token.allowance(wallet.address, await selfPermitTest.getAddress())).to.be.eq(value);

      await selfPermitTest.selfPermitIfNecessary(await token.getAddress(), value, MaxUint256, v, r, s);
    });
  });

  describe('#selfPermitAllowed', () => {
    it('works', async () => {
      const { v, r, s } = await getPermitSignature(wallet, token, await selfPermitTest.getAddress(), MaxUint256);

      expect(await token.allowance(wallet.address, await selfPermitTest.getAddress())).to.be.eq(0);
      await expect(selfPermitTest.selfPermitAllowed(await token.getAddress(), 0, MaxUint256, v, r, s))
        .to.emit(token, 'Approval')
        .withArgs(wallet.address, await selfPermitTest.getAddress(), MaxUint256);
      expect(await token.allowance(wallet.address, await selfPermitTest.getAddress())).to.be.eq(MaxUint256);
    });

    it('fails if permit is submitted externally', async () => {
      const { v, r, s } = await getPermitSignature(wallet, token, await selfPermitTest.getAddress(), MaxUint256);

      expect(await token.allowance(wallet.address, await selfPermitTest.getAddress())).to.be.eq(0);
      await token['permit(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)'](
        wallet.address,
        await selfPermitTest.getAddress(),
        0,
        MaxUint256,
        true,
        v,
        r,
        s
      );
      expect(await token.allowance(wallet.address, await selfPermitTest.getAddress())).to.be.eq(MaxUint256);

      await expect(
        selfPermitTest.selfPermitAllowed(await token.getAddress(), 0, MaxUint256, v, r, s)
      ).to.be.revertedWith('TestERC20PermitAllowed::permit: wrong nonce');
    });
  });

  describe('#selfPermitAllowedIfNecessary', () => {
    it('works', async () => {
      const { v, r, s } = await getPermitSignature(wallet, token, await selfPermitTest.getAddress(), MaxUint256);

      expect(await token.allowance(wallet.address, await selfPermitTest.getAddress())).to.eq(0);
      await expect(selfPermitTest.selfPermitAllowedIfNecessary(await token.getAddress(), 0, MaxUint256, v, r, s))
        .to.emit(token, 'Approval')
        .withArgs(wallet.address, await selfPermitTest.getAddress(), MaxUint256);
      expect(await token.allowance(wallet.address, await selfPermitTest.getAddress())).to.eq(MaxUint256);
    });

    it('skips if already max approved', async () => {
      const { v, r, s } = await getPermitSignature(wallet, token, await selfPermitTest.getAddress(), MaxUint256);

      expect(await token.allowance(wallet.address, await selfPermitTest.getAddress())).to.be.eq(0);
      await token.approve(await selfPermitTest.getAddress(), MaxUint256);
      await expect(
        selfPermitTest.selfPermitAllowedIfNecessary(await token.getAddress(), 0, MaxUint256, v, r, s)
      ).to.not.emit(token, 'Approval');
      expect(await token.allowance(wallet.address, await selfPermitTest.getAddress())).to.eq(MaxUint256);
    });

    it('does not fail if permit is submitted externally', async () => {
      const { v, r, s } = await getPermitSignature(wallet, token, await selfPermitTest.getAddress(), MaxUint256);

      expect(await token.allowance(wallet.address, await selfPermitTest.getAddress())).to.be.eq(0);
      await token['permit(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)'](
        wallet.address,
        await selfPermitTest.getAddress(),
        0,
        MaxUint256,
        true,
        v,
        r,
        s
      );
      expect(await token.allowance(wallet.address, await selfPermitTest.getAddress())).to.be.eq(MaxUint256);

      await selfPermitTest.selfPermitAllowedIfNecessary(await token.getAddress(), 0, MaxUint256, v, r, s);
    });
  });
});
