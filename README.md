
## Project overiew
This repository is a fork of [Algebrta Integral V1](https://github.com/cryptoalgebra/Algebra), with the following new features implemented:

1. Creation of final plugin implementations is replaced by the creation of BeaconProxy, with the possibility of further updates
2. Added public and private modes for creating pools in the factory. Where in private only an authorised address can create new pools
3. Implemented support for setting Blast governonce addresses for all major contracts for further collection of gas fee from them by Blast network mechanisms 
4. Implemented the ability to configure modes for rebasing tokens in pools
5. POOL_INIT_CODE_HASH variable to the current implementation

Other variables can be found in more detail in the [CHANGELOG](https://github.com/Satsyxbt/fenix-dex-v3/blob/main/CHANGELOG.md)

The focus of this competition is on the changes made, their impact, and integration with Blast L2 and FeesVaultFactory

## Additional Context
* This code will be deployed to `Blast L2` at launch, and it is the only blockchain considered to be in scope for this audit.
* [FeesVaultFactory](https://github.com/Satsyxbt/Fenix/blob/main/contracts/integration/FeesVaultFactory.sol) is a contract that will create `FeesVault` for v3 pool and use like `vaultFactory` in `AlgebraPoolFactory`

### Links
- [Fenix ve(3,3) Core](https://github.com/Satsyxbt/Fenix)
- [Algebra docs](https://docs.algebra.finance/)
- [CHANGELOG](https://github.com/Satsyxbt/fenix-dex-v3/blob/main/CHANGELOG.md)
- [Blast L2](https://blast.io/en)

### List of projects on which Fenix dex v3 is based:
- [Algebra](https://github.com/cryptoalgebra/Algebra/)
  
## Audit competition scope

All contract code marked as `[FULL]` is within the scope. The tag `[Only changes and his effect on other parts]` means that only the part that has been changed relative to the implementations from `Algebra` is within scope, including any impact these changes may have on other parts of the system. Any vulnerabilities critical to the system leading to loss of funds/blockages are also considered within scope.

The contracts listed below are partially or fully in the scope
```
https://github.com/Satsyxbt/Fenix-dex-v3

|-- src/
  |-- core/
    |-- contracts/
      |-- base/
          |-- BlastGovernorSetup.sol [Full]
          |-- BlastERC20RebasingManage.sol [Full]
          |-- AlgebraPoolBase.sol [Only changes and their effect on other parts]
      |-- AlgebraCommunityVault.sol [Only changes and their effect on other parts]
      |-- AlgebraFactory.sol [Only changes and their effect on other parts]
      |-- AlgebraPool.sol [Only changes and their effect on other parts]
      |-- AlgebraPoolDeployer.sol [Only changes and their effect on other parts]
      |-- AlgebraVaultFactoryStub.sol [Only changes and their effect on other parts]
  |-- farming/
    |-- contracts/
      |-- FarmingCenter.sol [Only changes and their effect on other parts]
      |-- AlgebraEthernalFarming.sol [Only changes and their effect on other parts]
      |-- EternalVirtualPool.sol [Only changes and their effect on other parts]
  |-- periphery/
    |-- contracts/
      |-- NonfungiblePositionManager.sol [Only changes and their effect on other parts]
      |-- V3Migrator.sol [Only changes and their effect on other parts]
      |-- SwapRouter.sol [Only changes and their effect on other parts]
      |-- lens/
        |-- Quoter.sol [Only changes and their effect on other parts]
        |-- QuoterV2.sol [Only changes and their effect on other parts]
        |-- AlgebraInterfaceMulticall.sol [Only changes and their effect on other parts]
  |-- plugin/
    |-- contracts/
      |-- AlgebraBasePluginV1.sol [Only changes and their effect on other parts]
      |-- BasePluginV1Factory.sol [Only changes and their effect on other parts]
```

## Out of scope
All other contracts that have not been amended or have not been affected by the changes are excluded from the analysis. As well as mock/test contracts

## Publicly Known Issues
The following issues are known:
* **Misconfiguration** - Any possible incorrect parameter settings in authorized methods.
* **Blast address hardcoded** - According to the documentation, the Blast address will be changeable in the mainnet, so this will also be changed in the code.
  
## Setup

### Getting the code
Clone this repository
```sh
git clone  https://github.com/Satsyxbt/Fenix-dex-v3
```


Enter into the directory
```sh
cd fenix-dex-v3
```

### Build

*Requires npm >= 8.0.0*

To install dependencies, you need to run the command in the root directory:
```
$ npm run bootstrap
```
This will download and install dependencies for all modules and set up husky hooks.



To compile a specific module, you need to run the following command in the module folder:
```
$ npm run compile
```


### Tests

Tests for a specific module are run by the following command in the module folder:
```
$ npm run test
```

### Tests coverage

To get a test coverage for specific module, you need to run the following command in the module folder:

```
$ npm run coverage
```

### Deploy
Firstly you need to create `.env` file in the root directory of project as in `env.example`.

To deploy all modules in specific network:
```
$ node scripts/deployAll.js <network>
```
