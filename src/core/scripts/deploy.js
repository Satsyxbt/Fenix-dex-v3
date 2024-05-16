const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const { chainId } = await hre.ethers.provider.getNetwork();

  let Config = getConfig(chainId);

  const [deployer] = await hre.ethers.getSigners();

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
  await factory.initialize(Config.BLAST_GOVERNOR, Config.BLAST_POINTS, Config.BLAST_POINTS_OPERATOR, poolDeployerAddress); // +2

  const PoolDeployerFactory = await hre.ethers.getContractFactory('AlgebraPoolDeployer');
  const poolDeployer = await PoolDeployerFactory.deploy(Config.BLAST_GOVERNOR, factory.target);

  await poolDeployer.waitForDeployment();

  console.log('Expected poolDeployer:', poolDeployerAddress, ', actual:', poolDeployer.target);
  console.log('AlgebraPoolDeployer to:', poolDeployer.target);
  console.log('AlgebraFactory deployed to:', factory.target);
  console.log('AlgebraFactoryImplementation deployed to:', algebraFactoryImplementation.target);
  console.log('ProxyAdmin deployed to:', proxyAdmin.target);

  const vaultFactory = await hre.ethers.getContractFactory('AlgebraCommunityVault');
  const vault = await vaultFactory.deploy(Config.BLAST_GOVERNOR, factory, deployer.address);

  await vault.waitForDeployment();

  console.log('AlgebraCommunityVault deployed to:', vault.target);

  const vaultFactoryStubFactory = await hre.ethers.getContractFactory('AlgebraVaultFactoryStub');
  const vaultFactoryStub = await vaultFactoryStubFactory.deploy(Config.BLAST_GOVERNOR, vault);

  await vaultFactoryStub.waitForDeployment();

  console.log('AlgebraVaultFactoryStub deployed to:', vaultFactoryStub.target);

  await factory.setVaultFactory(vaultFactoryStub);

  const deployDataPath = path.resolve(__dirname, '../../../' + Config.FILE);
  let deploysData = JSON.parse(fs.readFileSync(deployDataPath, 'utf8'));
  deploysData.poolDeployer = poolDeployer.target;
  deploysData.factory = factory.target;
  deploysData.algebraFactoryImplementation = algebraFactoryImplementation.target;
  deploysData.proxyAdmin = proxyAdmin.target;
  deploysData.vault = vault.target;
  deploysData.vaultFactory = vaultFactoryStub.target;
  fs.writeFileSync(deployDataPath, JSON.stringify(deploysData), 'utf-8');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
