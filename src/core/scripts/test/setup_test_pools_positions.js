const hre = require('hardhat');
const fs = require('fs');
const path = require('path');
const ethers = require('ethers');
const path = require('path');
const fs = require('fs');
const bn = require('bignumber.js');
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

function encodePriceSqrt(reserve1, reserve0) {
  return BigInt(new bn(reserve1.toString()).div(reserve0.toString()).sqrt().multipliedBy(new bn(2).pow(96)).integerValue(3).toString());
}

const Tokens = {
  WETH: '0x4200000000000000000000000000000000000023',
  USDB: '0x4200000000000000000000000000000000000023',
  fnUSD: '0x9e0f170B90b66C8a0f32A2FDBfc06FC479970e3a',
  fnTOK: '0x9Fe9D260262331807D0aa0fb06Fda1fa1b5E2ce5',
  FNX: '0xA12E4649fdDDEFD0FB390e4D4fb34fFbd2834fA6',
};

const { getConfig } = require('../../../scripts/networksConfig');

async function createAndInitialize(token0, token1, reserve0, reserve1) {
  const { chainId } = await hre.ethers.provider.getNetwork();
  let Config = getConfig(chainId);

  const deployDataPath = path.resolve(__dirname, '../../../' + Config.FILE);
  const deploysData = JSON.parse(fs.readFileSync(deployDataPath, 'utf8'));

  let deployer = await hre.ethers.getSigners()[0];

  const { abi: NfTPosManagerAbi } = require('../../src/periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json');
  const positionManager = new ethers.Contract(deploysData.nonfungiblePositionManager, NfTPosManagerAbi, deployer.address);

  let eps = encodePriceSqrt(reserve1, reserve0);
  if ((await token0.getAddress()).toLowerCase() < (await token1.getAddress()).toLowerCase()) {
  }

  const tx1 = await positionManager.createAndInitializePoolIfNecessary(token0.target, token1.target, eps);
  await tx1.wait();

  const mintParams = {
    token0: token0.target,
    token1: token1.target,
    tickLower: -887220,
    tickUpper: 887220,
    amount0Desired: 10n * 10n ** 18n,
    amount1Desired: 10n * 10n ** 18n,
    amount0Min: 0,
    amount1Min: 0,
    recipient: deployer.address,
    deadline: 2n ** 32n - 1n,
  };

  const tx2 = await positionManager.mint(mintParams);
  await tx2.wait();
}

async function main() {
  const FNX = await hre.ethers.getContractAt('TestERC20', Tokens.FNX);
  const fnUSD = await hre.ethers.getContractAt('TestERC20', Tokens.fnUSD);
  const WETH = await hre.ethers.getContractAt('TestERC20', Tokens.WETH);

  let ONE_FNX = BigInt(10) ** (await FNX.decimlas());
  let ONE_USD = BigInt(10) ** (await fnUSD.decimlas());
  let ONE_WETH = BigInt(10) ** (await WETH.decimlas());

  await createAndInitialize(FNX, fnUSD, ONE_FNX, ONE_USD);
  await createAndInitialize(FNX, WETH, ONE_FNX, BigInt(3540) * ONE_WETH);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
