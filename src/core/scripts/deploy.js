const hre = require('hardhat');
const fs = require('fs');
const path = require('path');
const { getConfig } = require('../../../scripts/networksConfig');

async function main() {
  const { chainId } = await hre.ethers.provider.getNetwork();
  const [deployer] = await hre.ethers.getSigners();

  let Config = getConfig(chainId);

  console.log(`Start deploy script
  \t-- with config: ${JSON.stringify(Config)}
  \t-- chainId: ${chainId}
  \t-- deployer: ${deployer.address}, Native balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} 
  `);

  console.log(`Validate contract mode config `);

  let sfs = await hre.ethers.getContractAt('ERC721', Config.MODE_SFS);
  console.log('Sfs assign token id owner:', await sfs.ownerOf(Config.SFS_ASSIGN_NFT_ID));

  const ProxyAdminFactory = await hre.ethers.getContractFactory('ProxyAdmin');
  const proxyAdmin = await ProxyAdminFactory.deploy();
  await proxyAdmin.waitForDeployment();

  const AlgebraFactory = await hre.ethers.getContractFactory('AlgebraFactoryUpgradeable');
  const algebraFactoryImplementation = await AlgebraFactory.deploy();
  await algebraFactoryImplementation.waitForDeployment();

  // precompute
  const poolDeployerAddress = hre.ethers.getCreateAddress({
    from: deployer.address,
    nonce: (await ethers.provider.getTransactionCount(deployer.address)) + 2,
  });

  const proxyFactory = await ethers.getContractFactory('TransparentUpgradeableProxy');
  const proxy = await proxyFactory.deploy(algebraFactoryImplementation.target, proxyAdmin.target, '0x'); // +1
  await proxy.waitForDeployment();

  const factory = AlgebraFactory.attach(proxy.target);
  await factory.initialize(Config.MODE_SFS, Config.SFS_ASSIGN_NFT_ID, poolDeployerAddress); // +2

  const PoolDeployerFactory = await hre.ethers.getContractFactory('AlgebraPoolDeployer');
  const poolDeployer = await PoolDeployerFactory.deploy(Config.MODE_SFS, Config.SFS_ASSIGN_NFT_ID, factory.target);

  await poolDeployer.waitForDeployment();

  console.log('Expected poolDeployer:', poolDeployerAddress, ', actual:', poolDeployer.target);
  console.log('AlgebraPoolDeployer to:', poolDeployer.target);
  console.log('AlgebraFactory deployed to:', factory.target);
  console.log('AlgebraFactoryImplementation deployed to:', algebraFactoryImplementation.target);
  console.log('ProxyAdmin deployed to:', proxyAdmin.target);

  console.log(`\nFinish deploy
  \t-- deployer: ${deployer.address}, Native balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} `);

  const deployDataPath = path.resolve(__dirname, '../../../scripts/deployment/' + Config.FILE);
  let deploysData = JSON.parse(fs.readFileSync(deployDataPath, 'utf8'));
  deploysData.poolDeployer = poolDeployer.target;
  deploysData.factory = factory.target;
  deploysData.algebraFactoryImplementation = algebraFactoryImplementation.target;
  deploysData.proxyAdmin = proxyAdmin.target;
  fs.writeFileSync(deployDataPath, JSON.stringify(deploysData), 'utf-8');

  console.log(`\nSave to ${deployDataPath}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
