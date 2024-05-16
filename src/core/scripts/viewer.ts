import hre from 'hardhat';
import path from 'path';
import fs from 'fs';
import { ethers } from 'hardhat';

import { getConfig } from '../../../scripts/networksConfig';
import { AlgebraCommunityVault, AlgebraFactoryUpgradeable, AlgebraVaultFactoryStub, IBlastNearMock } from '../typechain';

async function logFactory(factory: AlgebraFactoryUpgradeable, USDB: string, WETH: string) {
  console.log(`\nAlgebraFactory (${factory.target}):
      \tOwner:\t${await factory.owner()}
      \tPools Administrator Role:\t${await factory.POOLS_ADMINISTRATOR_ROLE()}
      \tPools Creator Role:\t${await factory.POOLS_CREATOR_ROLE()}
      \tPool Init Code Hash:\t${await factory.POOL_INIT_CODE_HASH()}
      \tPool Deployer:\t${await factory.poolDeployer()}
      \tDefault Blast Governor:\t${await factory.defaultBlastGovernor()}
      \tDefault Blast Points:\t${await factory.defaultBlastPoints()}
      \tDefault Blast Points Operator:\t${await factory.defaultBlastPointsOperator()}
      \tPublic Pool Creation Mode:\t${await factory.isPublicPoolCreationMode()}
      \tDefault Community Fee:\t${await factory.defaultCommunityFee()}
      \tDefault Fee:\t${await factory.defaultFee()}
      \tDefault Tickspacing:\t${await factory.defaultTickspacing()}
      \tRenounce Ownership Start Timestamp:\t${await factory.renounceOwnershipStartTimestamp()}
      \tDefault Plugin Factory:\t${await factory.defaultPluginFactory()}
      \tVault Factory:\t${await factory.vaultFactory()}
      \tWETH mode:\t${await factory.isRebaseToken(WETH)} \t${await factory.configurationForBlastRebaseTokens(WETH)} 
      \tUSDB mode:\t${await factory.isRebaseToken(USDB)} \t${await factory.configurationForBlastRebaseTokens(WETH)} 
    `);
}

async function logAlgebraVaultFactoryStub(vaultStub: AlgebraVaultFactoryStub) {
  console.log(`AlgebraVaultFactoryStub (${vaultStub.target}):
    \tDefault Algebra Community Vault:\t${await vaultStub.defaultAlgebraCommunityVault()}
    `);
}
async function logBlast(deploysData: any, blast: IBlastNearMock) {
  console.log(`\nBlast`);

  let keys = Object.keys(deploysData);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    console.log(`- ${key}\t${deploysData[key]}\t${await blast.governorMap(deploysData[key])}\t${await blast.readGasParams(deploysData[key])}`);
  }
}

async function logAlgebraCommunityVault(vault: AlgebraCommunityVault) {
  console.log(`AlgebraCommunityVault (${vault.target}):
    \tCommunity Fee Withdrawer Role:\t${await vault.COMMUNITY_FEE_WITHDRAWER_ROLE()}
    \tCommunity Fee Vault Administrator:\t${await vault.COMMUNITY_FEE_VAULT_ADMINISTRATOR()}
    \tCommunity Fee Receiver:\t${await vault.communityFeeReceiver()}
    \tAlgebra Fee:\t${await vault.algebraFee()}
    \tHas New Algebra Fee Proposal:\t${await vault.hasNewAlgebraFeeProposal()}
    \tProposed New Algebra Fee:\t${await vault.proposedNewAlgebraFee()}
    \tAlgebra Fee Receiver:\t${await vault.algebraFeeReceiver()}
    \tAlgebra Fee Manager:\t${await vault.algebraFeeManager()}
    `);
}

async function logNonfungiblePositionManager(positionManager: any) {
  console.log(`NonfungiblePositionManager  (${positionManager.target}):
    \tFactory Address:\t${await positionManager.factory()}
    \tPool Deployer Address:\t${await positionManager.poolDeployer()}
    \tWrapped Native Token Address:\t${await positionManager.WNativeToken()}
    \tFarming Center Address:\t${await positionManager.farmingCenter()}
    `);
}

async function logNonfungibleTokenPositionDescriptor(descriptor: any) {
  console.log(`NonfungibleTokenPositionDescriptor (${descriptor.target}):
    \tWNative Token Address:\t${await descriptor.WNativeToken()}
    \tCached Contract Address:\t${await descriptor.cachedThis()}
    \tnativeCurrencySymbol:\t${await descriptor.nativeCurrencySymbol()}
    `);
}

async function logSwapRouter(SwapRouter: any) {
  console.log(`SwapRouter  (${SwapRouter.target}):
      \tFactory Address:\t${await SwapRouter.factory()}
      \tPool Deployer Address:\t${await SwapRouter.poolDeployer()}
      \tWrapped Native Token Address:\t${await SwapRouter.WNativeToken()}
      `);
}
async function logQuoter(Quoter: any) {
  console.log(`Quoter  (${Quoter.target}):
        \tFactory Address:\t${await Quoter.factory()}
        \tPool Deployer Address:\t${await Quoter.poolDeployer()}
        \tWrapped Native Token Address:\t${await Quoter.WNativeToken()}
        `);
}
async function logV2Quoter(QuoterV2: any) {
  console.log(`QuoterV2  (${QuoterV2.target}):
          \tFactory Address:\t${await QuoterV2.factory()}
          \tPool Deployer Address:\t${await QuoterV2.poolDeployer()}
          \tWrapped Native Token Address:\t${await QuoterV2.WNativeToken()}
          `);
}

async function logBasePluginV1Factory(pluginFactory: any) {
  console.log(`BasePluginV1Factory (${pluginFactory.target}:
    \tAlgebra Base Plugin Factory Administrator Role:\t${await pluginFactory.ALGEBRA_BASE_PLUGIN_FACTORY_ADMINISTRATOR()}
    \tAlgebra Factory Address:\t${await pluginFactory.algebraFactory()}
    \tDefault Fee Configuration Address:\t${await pluginFactory.defaultFeeConfiguration()}
    \tFarming Address:\t${await pluginFactory.farmingAddress()}
    \tDefault Blast Governor Address:\t${await pluginFactory.defaultBlastGovernor()}
    \tImplementation Address:\t${await pluginFactory.implementation()}
    `);
}

async function logFarmingCenter(farmingCenter: any) {
  console.log(`FarmingCenter ${farmingCenter.target}:
    \tEternal Farming Address:\t${await farmingCenter.eternalFarming()}
    \tNonfungible Position Manager Address:\t${await farmingCenter.nonfungiblePositionManager()}
    \tAlgebra Pool Deployer Address:\t${await farmingCenter.algebraPoolDeployer()}
    `);
}

async function logAlgebraEternalFarming(eternalFarming: any) {
  console.log(`AlgebraEternalFarming (${eternalFarming.target}):
    \tIncentive Maker Role:\t${await eternalFarming.INCENTIVE_MAKER_ROLE()}
    \tFarmings Administrator Role:\t${await eternalFarming.FARMINGS_ADMINISTRATOR_ROLE()}
    \tNonfungible Position Manager Address:\t${await eternalFarming.nonfungiblePositionManager()}
    \tDefault Blast Governor Address:\t${await eternalFarming.defaultBlastGovernor()}
    \tFarming Center Address:\t${await eternalFarming.farmingCenter()}
    \tIs Emergency Withdraw Activated:\t${await eternalFarming.isEmergencyWithdrawActivated()}
    \tNumber of Incentives:\t${await eternalFarming.numOfIncentives()}
    `);
}

async function main() {
  const { chainId } = await hre.ethers.provider.getNetwork();
  let Config = getConfig(Number(chainId));

  const deployDataPath = path.resolve(__dirname, '../../../scripts/deployment/' + Config.FILE);
  let deploysData = JSON.parse(fs.readFileSync(deployDataPath, 'utf8'));

  let blast = (await hre.ethers.getContractAt('IBlastNearMock', Config.BLAST)) as any as IBlastNearMock;
  await logBlast(deploysData, blast);

  let factory = (await hre.ethers.getContractAt('AlgebraFactoryUpgradeable', deploysData.factory)) as any as AlgebraFactoryUpgradeable;
  await logFactory(factory, Config.USDB, Config.WETH);

  let vaultFactoryStub = (await hre.ethers.getContractAt('AlgebraVaultFactoryStub', deploysData.vaultFactory)) as any as AlgebraVaultFactoryStub;
  await logAlgebraVaultFactoryStub(vaultFactoryStub);

  let vault = (await hre.ethers.getContractAt('AlgebraCommunityVault', deploysData.vault)) as any as AlgebraCommunityVault;
  await logAlgebraCommunityVault(vault);

  const posPath = path.resolve(
    __dirname,
    '../../../src/periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
  );
  let positionManager = await ethers.getContractAtFromArtifact(JSON.parse(fs.readFileSync(posPath, 'utf8')), deploysData.nonfungiblePositionManager);
  await logNonfungiblePositionManager(positionManager);

  const desciptorPath = path.resolve(
    __dirname,
    '../../../src/periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json'
  );
  let descriptor = await ethers.getContractAtFromArtifact(
    JSON.parse(fs.readFileSync(desciptorPath, 'utf8')),
    deploysData.NonfungibleTokenPositionDescriptor
  );
  await logNonfungibleTokenPositionDescriptor(descriptor);

  const SwapRouterPath = path.resolve(__dirname, '../../../src/periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json');
  let SwapRouter = await ethers.getContractAtFromArtifact(JSON.parse(fs.readFileSync(SwapRouterPath, 'utf8')), deploysData.swapRouter);
  await logSwapRouter(SwapRouter);

  const quoterPath = path.resolve(__dirname, '../../../src/periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json');
  let quoter = await ethers.getContractAtFromArtifact(JSON.parse(fs.readFileSync(quoterPath, 'utf8')), deploysData.quoter);
  await logQuoter(quoter);

  const quoterV2Path = path.resolve(__dirname, '../../../src/periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json');
  let quoterV2 = await ethers.getContractAtFromArtifact(JSON.parse(fs.readFileSync(quoterV2Path, 'utf8')), deploysData.quoterV2);
  await logV2Quoter(quoterV2);

  const pluginFactoryPath = path.resolve(__dirname, '../../../src/plugin/artifacts/contracts/BasePluginV1Factory.sol/BasePluginV1Factory.json');
  let pluginFactory = await ethers.getContractAtFromArtifact(JSON.parse(fs.readFileSync(pluginFactoryPath, 'utf8')), deploysData.BasePluginV1Factory);
  await logBasePluginV1Factory(pluginFactory);

  const fcPath = path.resolve(__dirname, '../../../src/farming/artifacts/contracts/FarmingCenter.sol/FarmingCenter.json');
  let fc = await ethers.getContractAtFromArtifact(JSON.parse(fs.readFileSync(fcPath, 'utf8')), deploysData.fc);
  await logFarmingCenter(fc);

  const ethernalPath = path.resolve(
    __dirname,
    '../../../src/farming/artifacts/contracts/farmings/AlgebraEternalFarming.sol/AlgebraEternalFarming.json'
  );
  let ethernal = await ethers.getContractAtFromArtifact(JSON.parse(fs.readFileSync(ethernalPath, 'utf8')), deploysData.eternal);
  await logAlgebraEternalFarming(ethernal);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
