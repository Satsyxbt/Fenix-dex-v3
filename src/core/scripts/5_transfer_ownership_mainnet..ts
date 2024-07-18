import { AlgebraFactoryUpgradeable, IAlgebraFactory, ProxyAdmin } from '../typechain';

import hre from 'hardhat';
import path from 'path';
import fs from 'fs';

const TARGET_OWNER = '0xED8276141873621c18258D1c963C9F5d4014b5E5';

import { getConfig } from '../../../scripts/networksConfig';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

async function transferFactoryOwnership(deploysData: any, deployer: HardhatEthersSigner) {
  const AlgebraFactory = (await hre.ethers.getContractAt('AlgebraFactoryUpgradeable', deploysData.factory)) as any as AlgebraFactoryUpgradeable;

  console.log(`Transfer Factory Ownership:
  -- Current state
  \t owner() - ${await AlgebraFactory.owner()}
  \t pendingOwner() - ${await AlgebraFactory.pendingOwner()}
  -- Check roles
  \t old owner DEFAULT_ADMIN_ROLE - ${await AlgebraFactory.hasRole(await AlgebraFactory.DEFAULT_ADMIN_ROLE(), deployer.address)}
  \t old owner POOLS_ADMINISTRATOR_ROLE - ${await AlgebraFactory.hasRole(await AlgebraFactory.POOLS_ADMINISTRATOR_ROLE(), deployer.address)}
  \t old owner POOLS_CREATOR_ROLE - ${await AlgebraFactory.hasRole(await AlgebraFactory.POOLS_CREATOR_ROLE(), deployer.address)}
  \t count POOLS_CREATOR_ROLE - ${await AlgebraFactory.getRoleMemberCount(await AlgebraFactory.POOLS_CREATOR_ROLE())}
  \t count POOLS_CREATOR_ROLE - ${await AlgebraFactory.getRoleMemberCount(await AlgebraFactory.POOLS_ADMINISTRATOR_ROLE())}
  \t count POOLS_CREATOR_ROLE - ${await AlgebraFactory.getRoleMemberCount(await AlgebraFactory.DEFAULT_ADMIN_ROLE())}

  \t new owner DEFAULT_ADMIN_ROLE - ${await AlgebraFactory.hasRole(await AlgebraFactory.DEFAULT_ADMIN_ROLE(), TARGET_OWNER)}
  \t new owner POOLS_ADMINISTRATOR_ROLE - ${await AlgebraFactory.hasRole(await AlgebraFactory.POOLS_ADMINISTRATOR_ROLE(), TARGET_OWNER)}
  \t new owner POOLS_CREATOR_ROLE - ${await AlgebraFactory.hasRole(await AlgebraFactory.POOLS_CREATOR_ROLE(), TARGET_OWNER)}
  `);

  await AlgebraFactory.grantRole(await AlgebraFactory.POOLS_CREATOR_ROLE(), TARGET_OWNER);
  await AlgebraFactory.revokeRole(await AlgebraFactory.POOLS_CREATOR_ROLE(), deployer.address);

  await AlgebraFactory.transferOwnership(TARGET_OWNER);
  console.log(`-- Transfered

  -- After state
  \t owner() - ${await AlgebraFactory.owner()}
  \t pendingOwner() - ${await AlgebraFactory.pendingOwner()}
  -- Check roles
  \t old owner DEFAULT_ADMIN_ROLE - ${await AlgebraFactory.hasRole(await AlgebraFactory.DEFAULT_ADMIN_ROLE(), deployer.address)}
  \t old owner POOLS_ADMINISTRATOR_ROLE - ${await AlgebraFactory.hasRole(await AlgebraFactory.POOLS_ADMINISTRATOR_ROLE(), deployer.address)}
  \t old owner POOLS_CREATOR_ROLE - ${await AlgebraFactory.hasRole(await AlgebraFactory.POOLS_CREATOR_ROLE(), deployer.address)}
  \t count POOLS_CREATOR_ROLE - ${await AlgebraFactory.getRoleMemberCount(await AlgebraFactory.POOLS_CREATOR_ROLE())}
  \t count POOLS_CREATOR_ROLE - ${await AlgebraFactory.getRoleMemberCount(await AlgebraFactory.POOLS_ADMINISTRATOR_ROLE())}
  \t count POOLS_CREATOR_ROLE - ${await AlgebraFactory.getRoleMemberCount(await AlgebraFactory.DEFAULT_ADMIN_ROLE())}

  \t new owner DEFAULT_ADMIN_ROLE - ${await AlgebraFactory.hasRole(await AlgebraFactory.DEFAULT_ADMIN_ROLE(), TARGET_OWNER)}
  \t new owner POOLS_ADMINISTRATOR_ROLE - ${await AlgebraFactory.hasRole(await AlgebraFactory.POOLS_ADMINISTRATOR_ROLE(), TARGET_OWNER)}
  \t new owner POOLS_CREATOR_ROLE - ${await AlgebraFactory.hasRole(await AlgebraFactory.POOLS_CREATOR_ROLE(), TARGET_OWNER)}
  `);
}

async function transferProxyAdminOwnership(deploysData: any, deployer: HardhatEthersSigner) {
  const ProxyAdmin = (await hre.ethers.getContractAt('ProxyAdmin', deploysData.proxyAdmin)) as any as ProxyAdmin;

  console.log(`Transfer ProxyAdmin Ownership:
  -- Current state
  \t owner() - ${await ProxyAdmin.owner()}
  `);

  await ProxyAdmin.transferOwnership(TARGET_OWNER);

  console.log(`-- Transfered
  -- After state
  \t owner() - ${await ProxyAdmin.owner()}
  `);
}

async function main() {
  const { chainId } = await hre.ethers.provider.getNetwork();
  let Config = getConfig(Number(chainId));

  const deployDataPath = path.resolve(__dirname, '../../../' + Config.FILE);
  const deploysData = JSON.parse(fs.readFileSync(deployDataPath, 'utf8'));
  const [deployer] = await hre.ethers.getSigners();

  console.log(`Target owner: ${TARGET_OWNER}`);
  console.log(`Deployer: ${deployer.address}`);

  await transferFactoryOwnership(deploysData, deployer);
  await transferProxyAdminOwnership(deploysData, deployer);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
