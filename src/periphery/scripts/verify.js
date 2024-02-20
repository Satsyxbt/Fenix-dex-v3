const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const deployDataPath = path.resolve(__dirname, '../../../deploys.json');
  let deploysData = JSON.parse(fs.readFileSync(deployDataPath, 'utf8'));

  await hre.run('verify:verify', {
    address: deploysData.tickLens,
    constructorArguments: [],
  });

  await hre.run('verify:verify', {
    address: deploysData.quoter,
    constructorArguments: [deployer.address, deploysData.factory, deploysData.wrapped, deploysData.poolDeployer],
  });

  await hre.run('verify:verify', {
    address: deploysData.quoterV2,
    constructorArguments: [deployer.address, deploysData.factory, deploysData.wrapped, deploysData.poolDeployer],
  });

  await hre.run('verify:verify', {
    address: deploysData.swapRouter,
    constructorArguments: [deployer.address, deploysData.factory, deploysData.wrapped, deploysData.poolDeployer],
  });

  await hre.run('verify:verify', {
    address: deploysData.NFTDescriptor,
    constructorArguments: [],
  });

  await hre.run('verify:verify', {
    address: deploysData.nonfungiblePositionManager,
    constructorArguments: [
      deployer.address,
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
    constructorArguments: [deployer.address],
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
