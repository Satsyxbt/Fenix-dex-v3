const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

const { getConfig } = require('../../../scripts/networksConfig');

async function main() {
  const { chainId } = await hre.ethers.provider.getNetwork();
  const [deployer] = await hre.ethers.getSigners();

  let Config = getConfig(chainId);

  console.log(`Start deploy script
  \t-- with config: ${JSON.stringify(Config)}
  \t-- chainId: ${chainId}
  \t-- deployer: ${deployer.address}, Native balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} 
  `);

  const deployDataPath = path.resolve(__dirname, '../../../scripts/deployment/' + Config.FILE);
  const deploysData = JSON.parse(fs.readFileSync(deployDataPath, 'utf8'));

  const AlgebraBasePluginV1Factory = await hre.ethers.getContractFactory('AlgebraBasePluginV1');
  const bpImplementation = await AlgebraBasePluginV1Factory.deploy();
  await bpImplementation.waitForDeployment();
  console.log('AlgebraBasePluginV1 Implementation to:', bpImplementation.target);

  const BasePluginV1Factory = await hre.ethers.getContractFactory('BasePluginV1Factory');
  const dsFactory = await BasePluginV1Factory.deploy(Config.MODE_SFS, Config.SFS_ASSIGN_NFT_ID, deploysData.factory, bpImplementation.target);

  await dsFactory.waitForDeployment();

  console.log('PluginFactory to:', dsFactory.target);

  const factory = await hre.ethers.getContractAt('IAlgebraFactory', deploysData.factory);

  await factory.setDefaultPluginFactory(dsFactory.target);
  console.log('Updated plugin factory address in factory');
  console.log(`\nFinish deploy
  \t-- deployer: ${deployer.address}, Native balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} `);

  deploysData.AlgebraBasePluginV1 = bpImplementation.target;
  deploysData.BasePluginV1Factory = dsFactory.target;
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
