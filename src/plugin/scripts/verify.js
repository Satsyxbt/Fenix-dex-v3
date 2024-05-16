const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

const { getConfig } = require('../../../scripts/networksConfig');

async function main() {
  const { chainId } = await hre.ethers.provider.getNetwork();

  let Config = getConfig(chainId);

  const deployDataPath = path.resolve(__dirname, '../../../scripts/deployment/' + Config.FILE);
  let deploysData = JSON.parse(fs.readFileSync(deployDataPath, 'utf8'));

  const BasePluginV1Factory = deploysData.BasePluginV1Factory;

  await hre.run('verify:verify', {
    address: BasePluginV1Factory,
    constructorArguments: [Config.MODE_SFS, Config.SFS_ASSIGN_NFT_ID, deploysData.factory, deploysData.AlgebraBasePluginV1],
  });
  await hre.run('verify:verify', {
    address: deploysData.AlgebraBasePluginV1,
    constructorArguments: [],
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
