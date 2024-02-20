const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const deployDataPath = path.resolve(__dirname, '../../../deploys.json');
  const deploysData = JSON.parse(fs.readFileSync(deployDataPath, 'utf8'));

  const AlgebraBasePluginV1Factory = await hre.ethers.getContractFactory('AlgebraBasePluginV1');
  const bpImplementation = await AlgebraBasePluginV1Factory.deploy();
  await bpImplementation.waitForDeployment();
  console.log('AlgebraBasePluginV1 Implementation to:', bpImplementation.target);

  const BasePluginV1Factory = await hre.ethers.getContractFactory('BasePluginV1Factory');
  const dsFactory = await BasePluginV1Factory.deploy(deployer.address, deploysData.factory, bpImplementation.target);

  await dsFactory.waitForDeployment();

  console.log('PluginFactory to:', dsFactory.target);

  const factory = await hre.ethers.getContractAt('IAlgebraFactory', deploysData.factory);

  await factory.setDefaultPluginFactory(dsFactory.target);
  console.log('Updated plugin factory address in factory');

  deploysData.AlgebraBasePluginV1 = bpImplementation.target;
  deploysData.BasePluginV1Factory = dsFactory.target;
  fs.writeFileSync(deployDataPath, JSON.stringify(deploysData), 'utf-8');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
