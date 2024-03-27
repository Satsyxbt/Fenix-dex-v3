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
    address: deploysData.tickLens,
    constructorArguments: [],
  });

  await hre.run('verify:verify', {
    address: deploysData.quoter,
    constructorArguments: [Config.BLAST_GOVERNOR, deploysData.factory, deploysData.wrapped, deploysData.poolDeployer],
  });

  await hre.run('verify:verify', {
    address: deploysData.quoterV2,
    constructorArguments: [Config.BLAST_GOVERNOR, deploysData.factory, deploysData.wrapped, deploysData.poolDeployer],
  });

  await hre.run('verify:verify', {
    address: deploysData.swapRouter,
    constructorArguments: [Config.BLAST_GOVERNOR, deploysData.factory, deploysData.wrapped, deploysData.poolDeployer],
  });

  await hre.run('verify:verify', {
    address: deploysData.NFTDescriptor,
    constructorArguments: [],
  });

  await hre.run('verify:verify', {
    address: deploysData.nonfungiblePositionManager,
    constructorArguments: [
      Config.BLAST_GOVERNOR,
      deploysData.factory,
      deploysData.wrapped,
      deploysData.proxy,
      deploysData.poolDeployer,
    ],
  });
  await hre.run('verify:verify', {
    address: deploysData.proxy,
    constructorArguments: [deploysData.nonfungiblePositionManager, deployer.address, '0x'],
  });
  await hre.run('verify:verify', {
    address: deploysData.AlgebraInterfaceMulticall,
    constructorArguments: [Config.BLAST_GOVERNOR],
  });
  await hre.run('verify:verify', {
    address: deploysData.NonfungibleTokenPositionDescriptor,
    constructorArguments: [deploysData.wrapped, 'WTLS', []],
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
