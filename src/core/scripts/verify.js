const hre = require('hardhat');
const fs = require('fs');
const path = require('path');
const { getConfig } = require('../../../scripts/networksConfig');

async function main() {
  const { chainId } = await hre.ethers.provider.getNetwork();
  let Config = getConfig(chainId);

  const deployDataPath = path.resolve(__dirname, '../../../' + Config.FILE);
  let deploysData = JSON.parse(fs.readFileSync(deployDataPath, 'utf8'));

  await hre.run('verify:verify', {
    address: deploysData.algebraFactoryImplementation,
    constructorArguments: [],
  });

  await hre.run('verify:verify', {
    address: deploysData.proxyAdmin,
    constructorArguments: [],
  });

  await hre.run('verify:verify', {
    address: deploysData.factory,
    constructorArguments: [deploysData.algebraFactoryImplementation, deploysData.proxyAdmin, '0x'],
  });

  await hre.run('verify:verify', {
    address: deploysData.poolDeployer,
    constructorArguments: [Config.BLAST_GOVERNOR, deploysData.factory],
  });

  await hre.run('verify:verify', {
    address: deploysData.vault,
    constructorArguments: [Config.BLAST_GOVERNOR, deploysData.factory, deploysData.poolDeployer],
  });

  await hre.run('verify:verify', {
    address: deploysData.vaultFactory,
    constructorArguments: [Config.BLAST_GOVERNOR, deploysData.vault],
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
