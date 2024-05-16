import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { AlgebraEternalFarming } from '../../typechain';
import { algebraFixture, AlgebraFixtureType } from '../shared/fixtures';
import { expect } from '../shared';
import ModeSfsMock__Artifact from '@cryptoalgebra/integral-core/artifacts/contracts/test/ModeSfsMock.sol/ModeSfsMock.json';

describe('unit/Deployment', () => {
  let context: AlgebraFixtureType;

  beforeEach('create fixture loader', async () => {
    context = await loadFixture(algebraFixture);
  });

  it('deploys and has an address', async () => {
    const factoryModeSfs = await ethers.getContractFactoryFromArtifact(ModeSfsMock__Artifact);
    const modeSfs = await factoryModeSfs.deploy();
    const sfsAssignTokenId = 1;
    const farmingFactory = await ethers.getContractFactory('AlgebraEternalFarming');
    const farming = (await farmingFactory.deploy(modeSfs.target, sfsAssignTokenId, context.deployer, context.nft)) as any as AlgebraEternalFarming;
    expect(await farming.getAddress()).to.be.a.string;
  });

  it('sets immutable variables', async () => {
    const factoryModeSfs = await ethers.getContractFactoryFromArtifact(ModeSfsMock__Artifact);
    const modeSfs = await factoryModeSfs.deploy();
    const sfsAssignTokenId = 1;

    const farmingFactory = await ethers.getContractFactory('AlgebraEternalFarming');
    const farming = (await farmingFactory.deploy(modeSfs.target, sfsAssignTokenId, context.deployer, context.nft)) as any as AlgebraEternalFarming;

    expect(await farming.nonfungiblePositionManager()).to.equal(await context.nft.getAddress());
  });
});
