# Protocol Deployment Steps

## Gas Price Determination

The gas price is taken from the network's current target values and assumes an overestimation of 10-20% for a normal deployment. This is achieved by hardcoding the gas price or by entering a specific configuration in the hardhat config.

## Clearing Previous Deployment Residues

The `deploys.json` file must be cleared before starting a fresh protocol deployment. If there are entries in it, these will be used in the subsequent deployment.

## Setting the Current Blast Address
!!! IMPORTANT
```
File: fenix-dex-v3\src\core\contracts\base\BlastGovernorSetup.sol
28:     IBlast(0x4300000000000000000000000000000000000002).configureGovernor(gov_);
```
**This hardcoded address must be updated to the current one, followed by rerunning all tests and recalculating the new INIT_CODE_HASH for the pool.**

## Deployment as Algebra

Contracts should be deployed as specified by Algebra. In doing so:
1. In `fenix-dex-v3\src\periphery\scripts\deploy.js`
Replace the WETH address with the current one:
`const WNativeTokenAddress = '0x4200000000000000000000000000000000000023';`

2. In `fenix-dex-v3\src\core\scripts\4_setup_fees_vault_factory.js`
Replace the FEES_VAULT address with the current factory address for FeesVault:
`const FEES_VAULT = '0x26D760D86bec3CeaC9636DcDE75E6cA6733Ae290';`


## Gas Mode Configuration and Initial Settings

After deployment, the following should be executed:

* `2_setup_blast_gas_mode.js` - to set the Claimable mode for all contracts
* `3_setup_community_fee_to_100.js` - to set the distribution of 100% commission to FeesVault
* `4_setup_fees_vault_factory.js` - to set the current factory address from Fenix core
