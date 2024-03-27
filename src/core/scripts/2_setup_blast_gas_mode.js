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
  let blast = await hre.ethers.getContractAt('IBlastNearMock', Config.BLAST);
  let keys = Object.keys(deploysData);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    console.log(`Check setuped governor address for ${key} - ${deploysData[key]}`);
    let g = await blast.governorMap(deploysData[key]);
    console.log(`-- Governor - ${g}`);

    if (g == deployer.address) {
      console.log(`---- is Deployer set claimable gas`);
      let param = await blast.readGasParams(deploysData[key]);
      if (param[3] == 1) {
        console.log(`---- Claimable already set`);
      } else {
        console.log(`---- Set Gas Claimable`);
        await blast.configureClaimableGasOnBehalf(deploysData[key]);
      }
    } else {
      console.log(`---- Skip`);
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
