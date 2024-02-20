const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const deployDataPath = path.resolve(__dirname, '../../../deploys.json');
  let deploysData = JSON.parse(fs.readFileSync(deployDataPath, 'utf8'));

  await hre.run('verify:verify', {
    address: deploysData.eternal,
    constructorArguments: [deployer.address, deploysData.poolDeployer, deploysData.nonfungiblePositionManager],
  });

  await hre.run('verify:verify', {
    address: deploysData.fc,
    constructorArguments: [deployer.address, deploysData.eternal, deploysData.poolDeployer],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
