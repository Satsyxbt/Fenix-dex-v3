const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const deployDataPath = path.resolve(__dirname, '../../../deploys.json');
  let deploysData = JSON.parse(fs.readFileSync(deployDataPath, 'utf8'));
  const [deployer] = await hre.ethers.getSigners();

  await hre.run('verify:verify', {
    address: deploysData.factory,
    constructorArguments: [deployer.address, deploysData.poolDeployer],
  });

  await hre.run('verify:verify', {
    address: deploysData.poolDeployer,
    constructorArguments: [deployer.address, deploysData.factory],
  });

  await hre.run('verify:verify', {
    address: deploysData.vault,
    constructorArguments: [deployer.address, deploysData.factory, deploysData.poolDeployer],
  });

  await hre.run('verify:verify', {
    address: deploysData.vaultFactory,
    constructorArguments: [deployer.address, deploysData.vault],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
