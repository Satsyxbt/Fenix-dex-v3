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

  // WNativeTokenAddress
  const WNativeTokenAddress = Config.WETH;
  const signers = await hre.ethers.getSigners();
  const ProxyAdmin = deploysData.proxyAdmin;

  deploysData.wrapped = WNativeTokenAddress;

  const TickLensFactory = await hre.ethers.getContractFactory('TickLens');
  const TickLens = await TickLensFactory.deploy();

  await TickLens.waitForDeployment();

  deploysData.tickLens = TickLens.target;
  console.log('TickLens deployed to:', TickLens.target);

  // arg1 factory address
  // arg2 wnative address
  const QuoterFactory = await hre.ethers.getContractFactory('Quoter');
  const Quoter = await QuoterFactory.deploy(
    Config.BLAST_GOVERNOR,
    deploysData.factory,
    WNativeTokenAddress,
    deploysData.poolDeployer
  );

  await Quoter.waitForDeployment();

  deploysData.quoter = Quoter.target;
  console.log('Quoter deployed to:', Quoter.target);

  // arg1 factory address
  // arg2 wnative address
  const QuoterV2Factory = await hre.ethers.getContractFactory('QuoterV2');
  const QuoterV2 = await QuoterV2Factory.deploy(
    Config.BLAST_GOVERNOR,
    deploysData.factory,
    WNativeTokenAddress,
    deploysData.poolDeployer
  );

  await QuoterV2.waitForDeployment();
  deploysData.quoterV2 = QuoterV2.target;

  console.log('QuoterV2 deployed to:', QuoterV2.target);

  // arg1 factory address
  // arg2 wnative address
  const SwapRouterFactory = await hre.ethers.getContractFactory('SwapRouter');
  const SwapRouter = await SwapRouterFactory.deploy(
    Config.BLAST_GOVERNOR,
    deploysData.factory,
    WNativeTokenAddress,
    deploysData.poolDeployer
  );

  await SwapRouter.waitForDeployment();

  deploysData.swapRouter = SwapRouter.target;
  console.log('SwapRouter deployed to:', SwapRouter.target);

  const NFTDescriptorFactory = await hre.ethers.getContractFactory('NFTDescriptor');
  const NFTDescriptor = await NFTDescriptorFactory.deploy();

  await NFTDescriptor.waitForDeployment();
  deploysData.NFTDescriptor = NFTDescriptor.target;

  // arg1 wnative address
  const NonfungibleTokenPositionDescriptorFactory = await hre.ethers.getContractFactory(
    'NonfungibleTokenPositionDescriptor',
    {
      libraries: {
        NFTDescriptor: NFTDescriptor.target,
      },
    }
  );
  const NonfungibleTokenPositionDescriptor = await NonfungibleTokenPositionDescriptorFactory.deploy(
    WNativeTokenAddress,
    'WTLS',
    []
  );

  await NonfungibleTokenPositionDescriptor.waitForDeployment();
  deploysData.NonfungibleTokenPositionDescriptor = NonfungibleTokenPositionDescriptor.target;
  console.log('NonfungibleTokenPositionDescriptor deployed to:', NonfungibleTokenPositionDescriptor.target);

  //console.log('NFTDescriptor deployed to:', NFTDescriptor.target)
  const ProxyFactory = await hre.ethers.getContractFactory('TransparentUpgradeableProxy');
  const Proxy = await ProxyFactory.deploy(NonfungibleTokenPositionDescriptor.target, ProxyAdmin, '0x');

  await Proxy.waitForDeployment();

  deploysData.proxy = Proxy.target;

  console.log('Proxy deployed to:', Proxy.target);
  // // arg1 factory address
  // // arg2 wnative address
  // // arg3 tokenDescriptor address
  const NonfungiblePositionManagerFactory = await hre.ethers.getContractFactory('NonfungiblePositionManager');
  const NonfungiblePositionManager = await NonfungiblePositionManagerFactory.deploy(
    Config.BLAST_GOVERNOR,
    deploysData.factory,
    WNativeTokenAddress,
    Proxy.target,
    deploysData.poolDeployer
  );

  await NonfungiblePositionManager.waitForDeployment();

  deploysData.nonfungiblePositionManager = NonfungiblePositionManager.target;
  console.log('NonfungiblePositionManager deployed to:', NonfungiblePositionManager.target);

  // // arg1 factory address
  // // arg2 wnative address
  // // arg3 nonfungiblePositionManager address
  // const V3MigratorFactory = await hre.ethers.getContractFactory('V3Migrator');
  // const V3Migrator = await V3MigratorFactory.deploy(
  //   deploysData.factory,
  //   WNativeTokenAddress,
  //   NonfungiblePositionManager.target,
  //   deploysData.poolDeployer
  // );

  // await V3Migrator.waitForDeployment();

  const AlgebraInterfaceMulticallFactory = await hre.ethers.getContractFactory('AlgebraInterfaceMulticall');
  const AlgebraInterfaceMulticall = await AlgebraInterfaceMulticallFactory.deploy(Config.BLAST_GOVERNOR);

  await AlgebraInterfaceMulticall.waitForDeployment();
  deploysData.AlgebraInterfaceMulticall = AlgebraInterfaceMulticall.target;

  console.log('AlgebraInterfaceMulticall deployed to:', AlgebraInterfaceMulticall.target);
  // console.log('V3Migrator deployed to:', V3Migrator.target);

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
