const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

const FEES_VAULT = '0xabc03eF501C3eeF03Bb0a1338653A8DfF7f1e36E';
async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const deployDataPath = path.resolve(__dirname, '../../../deploys.json');
  const deploysData = JSON.parse(fs.readFileSync(deployDataPath, 'utf8'));

  const AlgebraFactory = await hre.ethers.getContractAt('AlgebraFactory', deploysData.factory);
  await AlgebraFactory.setVaultFactory(FEES_VAULT);
  console.log('Updated FeesVault in Factory to', FEES_VAULT);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
