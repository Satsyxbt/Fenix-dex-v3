
# [19.02.2024] Implementation Fenix features

## Global Changes
### Added
* To support gas reciving, and yield from the `Blast` network, an inheritance from `BlastGovernorManage` was added for each significant contract, with the initialization of the control address. In the case of factories, the functionality of setting the address for future deployable contracts is also available

## AlgebraFactory Contract Update

### Added
The main point of the changes was to add functionality to limit the public creation of pools to ordinary users

* New role `POOLS_CREATOR_ROLE` to manage pool creation permissions
* Public pool creation mode toggle function `setIsPublicPoolCreationMode(bool mode_)` allowing the contract owner to enable or disable public pools creation mode
  
### Changed
* The `createPool` function now includes a check for `POOLS_CREATOR_ROLE` if `isPublicPoolCreationMode` is not enabled, ensuring that only authorized creators can create pools unless the public creation mode is active.

## BasePluginV1Factory Contract Update
The essence of the changes was to support proxy contracts in the plugin with the possibility of further updating via `BeaconProxy`

### Added
* Implementation of the beacon proxy pattern through the introduction of `@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol` import, replacing the direct creation of `AlgebraBasePluginV1` instances with beacon proxy instances for plugin creation. 

* New function `upgradeTo(address newImplementation)` allowing the administrator to upgrade the plugin implementation for all future/previeus deployments
* Private function `_setImplementation(address newImplementation)` to set the beacon's implementation address, encapsulating the logic for updating the plugin implementation, which ensures that only valid contracts can be set as new implementations.
## Changed
* The constructor now accepts an additional argument `_basePluginV1Implementation` for setting the initial implementation of the beacon, making the contract immediately ready for creating beacon proxies with the specified plugin implementation.
* The `_createPlugin` function now creates `IAlgebraBasePluginV1` instances using the `BeaconProxy` pattern instead of directly deploying `AlgebraBasePluginV1` instances
  
## Removed
Direct dependency on the `AlgebraBasePluginV1.sol` contract file and its import statement, as the implementation details are now abstracted away by the beacon proxy pattern.


## AlgebraBasePluginV1 Contract Update
The changes consisted in the ability of the contract to be used in the form of implementations for BeaconProxy and maintaining the state of the watchdog in future updates

### Added
* Upgradeability through the use of` @openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol` and `TimestampUpgradeable`
* Additional storage space reserved (`uint256[50] private __gap;`) for future variables to ensure that the storage layout remains compatible with future upgrades.
  
### Changed
* Transition from a non-upgradeable contract to an upgradeable one using `OpenZeppelin's` upgradeable contracts framework
* Modification of contract initialization logic to accommodate the upgradeable pattern, shifting from setting immutable variables in the constructor to setting state variables in an `initialize` function.

### Removed
* The immutable keyword from the `pool`, `factory`, and `pluginFactory` state variables, as upgradeable contracts require mutable state variables to allow for changes post-deployment.


## Other changes
### Changed
*  Previously relying on npm packages such as `@cryptoalgebra/integral-base-plugin`, `@cryptoalgebra/integral-core`, and `@cryptoalgebra/integral-periphery`, the project has now transitioned to using local implementations.
* The `frequency of sending` fees from the pool to the vault has been changed from `8 hours` to `1`
* The `Algebra` headers in the descriptions and names of the pool symbols have been replaced with Fenix
```diff
- 'This NFT represents a liquidity position in a Algebra '
+'This NFT represents a liquidity position in a Fenix '

-'Algebra - ',
+'Fenix - '

- ERC721Permit('Algebra Positions NFT-V2', 'ALGB-POS', '2')
+ ERC721Permit('Fenix Positions NFT-V2', 'FNX-POS', '2')

```