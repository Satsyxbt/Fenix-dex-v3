import hre, { ethers } from 'hardhat';

async function main() {
  const BLAST_GOVERNOR = '0x5D72e06D2A2d9b897Ea84Cd88606Ad9E40ba4228';

  let newImplementation = await ethers.deployContract('AlgebraFactoryUpgradeable', [BLAST_GOVERNOR]);
  await newImplementation.waitForDeployment();

  console.log('Deployed AlgebraFactoryUpgradeable_Implementation', newImplementation.target);

  await hre.run('verify:verify', {
    address: newImplementation.target,
    constructorArguments: [BLAST_GOVERNOR],
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
