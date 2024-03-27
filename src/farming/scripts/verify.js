const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

const { getConfig } = require('../../../scripts/networksConfig');

async function main() {
  const { chainId } = await hre.ethers.provider.getNetwork();

  let Config = getConfig(chainId);
  const [deployer] = await hre.ethers.getSigners();

  const deployDataPath = path.resolve(__dirname, '../../../' + Config.FILE);

  let deploysData = JSON.parse(fs.readFileSync(deployDataPath, 'utf8'));

  await hre.run('verify:verify', {
    address: deploysData.eternal,
    constructorArguments: [Config.BLAST_GOVERNOR, deploysData.poolDeployer, deploysData.nonfungiblePositionManager],
  });

  await hre.run('verify:verify', {
    address: deploysData.fc,
    constructorArguments: [Config.BLAST_GOVERNOR, deploysData.eternal, deploysData.nonfungiblePositionManager],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
