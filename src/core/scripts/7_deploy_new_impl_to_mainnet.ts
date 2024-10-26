import hre, { ethers } from 'hardhat';

async function main() {
  const BLAST_GOVERNOR = '0x72e47b1eaAAaC6c07Ea4071f1d0d355f603E1cc1';

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
