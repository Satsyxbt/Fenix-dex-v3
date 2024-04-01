import hre from 'hardhat';
import path from 'path';
import fs from 'fs';

import { getConfig } from '../../../scripts/networksConfig';
import { AlgebraFactoryUpgradeable } from '../typechain';

const TARGET_BLAST_GOVERNOR = '0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4';

async function main() {
  const { chainId } = await hre.ethers.provider.getNetwork();
  let Config = getConfig(Number(chainId));

  const deployDataPath = path.resolve(__dirname, '../../../' + Config.FILE);
  const deploysData = JSON.parse(fs.readFileSync(deployDataPath, 'utf8'));

  const AlgebraFactory = (await hre.ethers.getContractAt('AlgebraFactoryUpgradeable', deploysData.factory)) as any as AlgebraFactoryUpgradeable;

  console.log('setup Claimable mode for WETH for all new pools');
  await AlgebraFactory.setConfigurationForRebaseToken(Config.WETH, true, 2);

  console.log('setup Claimable mode for USDB for all new pools');
  await AlgebraFactory.setConfigurationForRebaseToken(Config.USDB, true, 2);

  console.log('setup 90% fee to LP by default, 10% to FeesVault');
  await AlgebraFactory.setDefaultCommunityFee(10);

  console.log('setup 0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4 like default blast governor address in factory');
  await AlgebraFactory.setDefaultBlastGovernor('0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4');

  console.log(`setup ${TARGET_BLAST_GOVERNOR} like default blast points operator`);
  await AlgebraFactory.setDefaultBlastPointsOperator(TARGET_BLAST_GOVERNOR);

  const ethernalPath = path.resolve(
    __dirname,
    '../../../src/farming/artifacts/contracts/farmings/AlgebraEternalFarming.sol/AlgebraEternalFarming.json'
  );

  console.log(`setup ${TARGET_BLAST_GOVERNOR} like default blast governor in ETHERNAL`);
  const AlgebraEternalFarming = await hre.ethers.getContractAtFromArtifact(JSON.parse(fs.readFileSync(ethernalPath, 'utf8')), deploysData.eternal);
  await AlgebraEternalFarming.setDefaultBlastGovernor(TARGET_BLAST_GOVERNOR);

  console.log(`setup ${TARGET_BLAST_GOVERNOR} like default blast governor in BasePluginV1Factory`);
  const pluginFactoryPath = path.resolve(__dirname, '../../../src/plugin/artifacts/contracts/BasePluginV1Factory.sol/BasePluginV1Factory.json');
  let BasePluginV1Factory = await hre.ethers.getContractAtFromArtifact(
    JSON.parse(fs.readFileSync(pluginFactoryPath, 'utf8')),
    deploysData.BasePluginV1Factory
  );
  await BasePluginV1Factory.setDefaultBlastGovernor(TARGET_BLAST_GOVERNOR);

  // console.log('setup Public Creation Pool mode');
  // await AlgebraFactory.setIsPublicPoolCreationMode(true);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
