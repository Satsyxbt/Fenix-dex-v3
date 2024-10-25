import { AlgebraFactoryUpgradeable, IAlgebraFactory, ProxyAdmin } from '../typechain';

import hre, { ethers } from 'hardhat';

async function main() {
  const BLAST_REBASING_TOKENS_GOVERNOR = '0x76da5656DEa3D8A8111aB749042f98103198332F';
  const BLAST_GOVERNOR = '0x5D72e06D2A2d9b897Ea84Cd88606Ad9E40ba4228';

  let newImplementation = await ethers.deployContract('AlgebraFactoryUpgradeable', [BLAST_GOVERNOR]);
  await newImplementation.waitForDeployment();

  console.log('Deployed AlgebraFactoryUpgradeable_Implementation', newImplementation.target);

  let ProxyAdmin = (await ethers.getContractAt('ProxyAdmin', '0x44b43b13052Ea0ff260d67F177d9932570Bd5C33')) as any as ProxyAdmin;
  let factory = (await ethers.getContractAt(
    'AlgebraFactoryUpgradeable',
    '0x242A0C57EAf78A061db42D913DE7FA4eA648a1Ef'
  )) as any as AlgebraFactoryUpgradeable;

  await ProxyAdmin.upgrade(factory.target, newImplementation.target);

  await factory.setRebasingTokensGovernor(BLAST_REBASING_TOKENS_GOVERNOR);

  await factory.setDefaultBlastGovernor(BLAST_GOVERNOR);

  await factory.grantRole(await factory.POOLS_ADMINISTRATOR_ROLE(), BLAST_REBASING_TOKENS_GOVERNOR);

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
