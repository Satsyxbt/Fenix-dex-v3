const hre = require('hardhat');
const fs = require('fs');
const path = require('path');
const BasePluginV1FactoryComplied = require('../../plugin/artifacts/contracts/BasePluginV1Factory.sol/BasePluginV1Factory.json');

const { getConfig } = require('../../../scripts/networksConfig');

async function main() {
  const { chainId } = await hre.ethers.provider.getNetwork();

  let Config = getConfig(chainId);
  const [deployer] = await hre.ethers.getSigners();

  console.log(`Start deploy script
  \t-- with config: ${JSON.stringify(Config)}
  \t-- chainId: ${chainId}
  \t-- deployer: ${deployer.address}, Native balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} 
  `);
  const deployDataPath = path.resolve(__dirname, '../../../scripts/deployment/' + Config.FILE);
  const deploysData = JSON.parse(fs.readFileSync(deployDataPath, 'utf8'));

  const AlgebraEternalFarmingFactory = await hre.ethers.getContractFactory('AlgebraEternalFarming');
  const AlgebraEternalFarming = await AlgebraEternalFarmingFactory.deploy(
    Config.MODE_SFS,
    Config.SFS_ASSIGN_NFT_ID,
    deploysData.poolDeployer,
    deploysData.nonfungiblePositionManager
  );

  deploysData.eternal = AlgebraEternalFarming.target;

  await AlgebraEternalFarming.waitForDeployment();
  console.log('AlgebraEternalFarming deployed to:', AlgebraEternalFarming.target);

  const FarmingCenterFactory = await hre.ethers.getContractFactory('FarmingCenter');
  const FarmingCenter = await FarmingCenterFactory.deploy(
    Config.MODE_SFS,
    Config.SFS_ASSIGN_NFT_ID,
    AlgebraEternalFarming.target,
    deploysData.nonfungiblePositionManager
  );

  deploysData.fc = FarmingCenter.target;

  await FarmingCenter.waitForDeployment();
  console.log('FarmingCenter deployed to:', FarmingCenter.target);

  await AlgebraEternalFarming.setFarmingCenterAddress(FarmingCenter.target);
  console.log('Updated farming center address in eternal(incentive) farming');

  const pluginFactory = await hre.ethers.getContractAt(BasePluginV1FactoryComplied.abi, deploysData.BasePluginV1Factory);

  await pluginFactory.setFarmingAddress(FarmingCenter.target);
  console.log('Updated farming center address in plugin factory');
  console.log(`\nFinish deploy
  \t-- deployer: ${deployer.address}, Native balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} `);

  const posManager = await hre.ethers.getContractAt('INonfungiblePositionManager', deploysData.nonfungiblePositionManager);
  await posManager.setFarmingCenter(FarmingCenter.target);

  fs.writeFileSync(deployDataPath, JSON.stringify(deploysData), 'utf-8');

  console.log(`\nSave to ${deployDataPath}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
