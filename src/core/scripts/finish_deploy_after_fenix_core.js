const hre = require('hardhat');
const fs = require('fs');
const path = require('path');
const { getConfig } = require('../../../scripts/networksConfig');

const FEES_VAULT_FACTORY_V3 = '';

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
  let deploysData = JSON.parse(fs.readFileSync(deployDataPath, 'utf8'));

  const factory = await hre.ethers.getContractAt('AlgebraFactoryUpgradeable', deploysData.factory);

  console.log('  await factory.setIsPublicPoolCreationMode(true);');
  await factory.setIsPublicPoolCreationMode(true);

  console.log('  await factory.setVaultFactory(FEES_VAULT_FACTORY_V3);  ');
  await factory.setVaultFactory(FEES_VAULT_FACTORY_V3);

  console.log('  await factory.setDefaultCommunityFee(10); ');
  await factory.setDefaultCommunityFee(10);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
