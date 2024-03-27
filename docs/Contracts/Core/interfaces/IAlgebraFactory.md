

# IAlgebraFactory


The interface for the Algebra Factory



*Developer note: Credit to Uniswap Labs under GPL-2.0-or-later license:
https://github.com/Uniswap/v3-core/tree/main/contracts/interfaces*


## Events
### RenounceOwnershipStart

```solidity
event RenounceOwnershipStart(uint256 timestamp, uint256 finishTimestamp)
```

Emitted when a process of ownership renounce is started

| Name | Type | Description |
| ---- | ---- | ----------- |
| timestamp | uint256 | The timestamp of event |
| finishTimestamp | uint256 | The timestamp when ownership renounce will be possible to finish |

### RenounceOwnershipStop

```solidity
event RenounceOwnershipStop(uint256 timestamp)
```

Emitted when a process of ownership renounce cancelled

| Name | Type | Description |
| ---- | ---- | ----------- |
| timestamp | uint256 | The timestamp of event |

### RenounceOwnershipFinish

```solidity
event RenounceOwnershipFinish(uint256 timestamp)
```

Emitted when a process of ownership renounce finished

| Name | Type | Description |
| ---- | ---- | ----------- |
| timestamp | uint256 | The timestamp of ownership renouncement |

### Pool

```solidity
event Pool(address token0, address token1, address pool)
```

Emitted when a pool is created

| Name | Type | Description |
| ---- | ---- | ----------- |
| token0 | address | The first token of the pool by address sort order |
| token1 | address | The second token of the pool by address sort order |
| pool | address | The address of the created pool |

### DefaultCommunityFee

```solidity
event DefaultCommunityFee(uint16 newDefaultCommunityFee)
```

Emitted when the default community fee is changed

| Name | Type | Description |
| ---- | ---- | ----------- |
| newDefaultCommunityFee | uint16 | The new default community fee value |

### DefaultTickspacing

```solidity
event DefaultTickspacing(int24 newDefaultTickspacing)
```

Emitted when the default tickspacing is changed

| Name | Type | Description |
| ---- | ---- | ----------- |
| newDefaultTickspacing | int24 | The new default tickspacing value |

### DefaultFee

```solidity
event DefaultFee(uint16 newDefaultFee)
```

Emitted when the default fee is changed

| Name | Type | Description |
| ---- | ---- | ----------- |
| newDefaultFee | uint16 | The new default fee value |

### DefaultPluginFactory

```solidity
event DefaultPluginFactory(address defaultPluginFactoryAddress)
```

Emitted when the defaultPluginFactory address is changed

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultPluginFactoryAddress | address | The new defaultPluginFactory address |

### VaultFactory

```solidity
event VaultFactory(address newVaultFactory)
```

Emitted when the vaultFactory address is changed

| Name | Type | Description |
| ---- | ---- | ----------- |
| newVaultFactory | address | The new vaultFactory address |

### PublicPoolCreationMode

```solidity
event PublicPoolCreationMode(bool mode_)
```

Emitted when the pools creation mode is changed

| Name | Type | Description |
| ---- | ---- | ----------- |
| mode_ | bool | The new pools creation mode |

### DefaultBlastGovernor

```solidity
event DefaultBlastGovernor(address defaultBlastGovernor)
```



*Developer note: Emitted when set new default blast governor address is changed.*

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultBlastGovernor | address | The new default blast governor address |

### DefaultBlastPoints

```solidity
event DefaultBlastPoints(address defaultBlastPoints)
```



*Developer note: Emitted when set new default blast points address is changed.*

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultBlastPoints | address | The new default blast points address |

### DefaultBlastPointsOperator

```solidity
event DefaultBlastPointsOperator(address defaultBlastPointsOperator)
```



*Developer note: Emitted when set new default blast points operator address is changed.*

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultBlastPointsOperator | address | The new default blast points operator address |

### ConfigurationForRebaseToken

```solidity
event ConfigurationForRebaseToken(address token, bool isRebase, enum YieldMode mode)
```

Emitted when the rebase configuration for a token is set or updated

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | The address of the token whose rebase configuration has been set or updated |
| isRebase | bool | Indicates whether the token is set as a rebasing token |
| mode | enum YieldMode | The yield mode that has been set for the token, defining its rebasing behavior |


## Functions
### POOLS_ADMINISTRATOR_ROLE

```solidity
function POOLS_ADMINISTRATOR_ROLE() external view returns (bytes32)
```
**Selector**: `0xb500a48b`

role that can change communityFee and tickspacing in pools

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | The hash corresponding to this role |

### POOLS_CREATOR_ROLE

```solidity
function POOLS_CREATOR_ROLE() external view returns (bytes32)
```
**Selector**: `0x6e1433dc`

role that can create pools when public pool creation is disabled

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | The hash corresponding to this role |

### hasRoleOrOwner

```solidity
function hasRoleOrOwner(bytes32 role, address account) external view returns (bool)
```
**Selector**: `0xe8ae2b69`

Returns &#x60;true&#x60; if &#x60;account&#x60; has been granted &#x60;role&#x60; or &#x60;account&#x60; is owner.

| Name | Type | Description |
| ---- | ---- | ----------- |
| role | bytes32 | The hash corresponding to the role |
| account | address | The address for which the role is checked |

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool Whether the address has this role or the owner role or not |

### owner

```solidity
function owner() external view returns (address)
```
**Selector**: `0x8da5cb5b`

Returns the current owner of the factory

*Developer note: Can be changed by the current owner via transferOwnership(address newOwner)*

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the factory owner |

### defaultBlastGovernor

```solidity
function defaultBlastGovernor() external view returns (address)
```
**Selector**: `0xfb6cd276`

Returns the current default blast governor

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the default blast governor |

### defaultBlastPoints

```solidity
function defaultBlastPoints() external view returns (address)
```
**Selector**: `0xa6df1ec9`

Returns the current default blast points

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the default blast points |

### defaultBlastPointsOperator

```solidity
function defaultBlastPointsOperator() external view returns (address)
```
**Selector**: `0x32cf1b01`

Returns the current default blast points operator

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the default blast points operator |

### configurationForBlastRebaseTokens

```solidity
function configurationForBlastRebaseTokens(address token) external view returns (enum YieldMode)
```
**Selector**: `0xd1dc415e`

Retrieves the yield mode configuration for a specified token

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | The address of the token for which to retrieve the yield mode |

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | enum YieldMode | The yield mode (rebasing configuration) set for the given token |

### isRebaseToken

```solidity
function isRebaseToken(address token) external view returns (bool)
```
**Selector**: `0xc073b7a5`

Return if a token is marked as a rebasing token in the factory configuration

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | The address of the token to check |

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the token is a rebasing token, false otherwise |

### poolDeployer

```solidity
function poolDeployer() external view returns (address)
```
**Selector**: `0x3119049a`

Returns the current poolDeployerAddress

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the poolDeployer |

### isPublicPoolCreationMode

```solidity
function isPublicPoolCreationMode() external view returns (bool)
```
**Selector**: `0x63d21273`

Returns the status of enable public pool creation mode

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool Whether the public creation mode is enable or not |

### defaultCommunityFee

```solidity
function defaultCommunityFee() external view returns (uint16)
```
**Selector**: `0x2f8a39dd`

Returns the default community fee

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint16 | Fee which will be set at the creation of the pool |

### defaultFee

```solidity
function defaultFee() external view returns (uint16)
```
**Selector**: `0x5a6c72d0`

Returns the default fee

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint16 | Fee which will be set at the creation of the pool |

### defaultTickspacing

```solidity
function defaultTickspacing() external view returns (int24)
```
**Selector**: `0x29bc3446`

Returns the default tickspacing

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int24 | Tickspacing which will be set at the creation of the pool |

### defaultPluginFactory

```solidity
function defaultPluginFactory() external view returns (contract IAlgebraPluginFactory)
```
**Selector**: `0xd0ad2792`

Return the current pluginFactory address

*Developer note: This contract is used to automatically set a plugin address in new liquidity pools*

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | contract IAlgebraPluginFactory | Algebra plugin factory |

### vaultFactory

```solidity
function vaultFactory() external view returns (contract IAlgebraVaultFactory)
```
**Selector**: `0xd8a06f73`

Return the current vaultFactory address

*Developer note: This contract is used to automatically set a vault address in new liquidity pools*

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | contract IAlgebraVaultFactory | Algebra vault factory |

### defaultConfigurationForPool

```solidity
function defaultConfigurationForPool(address pool) external view returns (uint16 communityFee, int24 tickSpacing, uint16 fee, address communityFeeVault)
```
**Selector**: `0x82b13d8d`

Returns the default communityFee, tickspacing, fee and communityFeeVault for pool

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | the address of liquidity pool |

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| communityFee | uint16 | which will be set at the creation of the pool |
| tickSpacing | int24 | which will be set at the creation of the pool |
| fee | uint16 | which will be set at the creation of the pool |
| communityFeeVault | address | the address of communityFeeVault |

### computePoolAddress

```solidity
function computePoolAddress(address token0, address token1) external view returns (address pool)
```
**Selector**: `0xd8ed2241`

Deterministically computes the pool address given the token0 and token1

*Developer note: The method does not check if such a pool has been created*

| Name | Type | Description |
| ---- | ---- | ----------- |
| token0 | address | first token |
| token1 | address | second token |

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | The contract address of the Algebra pool |

### poolByPair

```solidity
function poolByPair(address tokenA, address tokenB) external view returns (address pool)
```
**Selector**: `0xd9a641e1`

Returns the pool address for a given pair of tokens, or address 0 if it does not exist

*Developer note: tokenA and tokenB may be passed in either token0/token1 or token1/token0 order*

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenA | address | The contract address of either token0 or token1 |
| tokenB | address | The contract address of the other token |

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | The pool address |

### POOL_INIT_CODE_HASH

```solidity
function POOL_INIT_CODE_HASH() external view returns (bytes32)
```
**Selector**: `0xdc6fd8ab`

returns keccak256 of AlgebraPool init bytecode.

*Developer note: the hash value changes with any change in the pool bytecode*

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | Keccak256 hash of AlgebraPool contract init bytecode |

### renounceOwnershipStartTimestamp

```solidity
function renounceOwnershipStartTimestamp() external view returns (uint256 timestamp)
```
**Selector**: `0x084bfff9`



**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| timestamp | uint256 | The timestamp of the beginning of the renounceOwnership process |

### createPool

```solidity
function createPool(address tokenA, address tokenB) external returns (address pool)
```
**Selector**: `0xe3433615`

Creates a pool for the given two tokens

*Developer note: tokenA and tokenB may be passed in either order: token0/token1 or token1/token0.
The call will revert if the pool already exists or the token arguments are invalid.*

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenA | address | One of the two tokens in the desired pool |
| tokenB | address | The other of the two tokens in the desired pool |

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | The address of the newly created pool |

### setIsPublicPoolCreationMode

```solidity
function setIsPublicPoolCreationMode(bool mode_) external
```
**Selector**: `0x5d2493ab`



*Developer note: updates pools creation mode*

| Name | Type | Description |
| ---- | ---- | ----------- |
| mode_ | bool | the new mode for pools creation proccess |

### setConfigurationForRebaseToken

```solidity
function setConfigurationForRebaseToken(address token_, bool isRebase_, enum YieldMode mode_) external
```
**Selector**: `0x3821a08a`

Sets the rebase configuration for a specific token

| Name | Type | Description |
| ---- | ---- | ----------- |
| token_ | address | The address of the token to configure |
| isRebase_ | bool | A boolean indicating whether the token is a rebasing token or not |
| mode_ | enum YieldMode | The yield mode to apply, defining how the rebasing mechanism should operate |

### setDefaultCommunityFee

```solidity
function setDefaultCommunityFee(uint16 newDefaultCommunityFee) external
```
**Selector**: `0x8d5a8711`



*Developer note: updates default community fee for new pools*

| Name | Type | Description |
| ---- | ---- | ----------- |
| newDefaultCommunityFee | uint16 | The new community fee, _must_ be <= MAX_COMMUNITY_FEE |

### setDefaultFee

```solidity
function setDefaultFee(uint16 newDefaultFee) external
```
**Selector**: `0x77326584`



*Developer note: updates default fee for new pools*

| Name | Type | Description |
| ---- | ---- | ----------- |
| newDefaultFee | uint16 | The new fee, _must_ be <= MAX_DEFAULT_FEE |

### setDefaultTickspacing

```solidity
function setDefaultTickspacing(int24 newDefaultTickspacing) external
```
**Selector**: `0xf09489ac`



*Developer note: updates default tickspacing for new pools*

| Name | Type | Description |
| ---- | ---- | ----------- |
| newDefaultTickspacing | int24 | The new tickspacing, _must_ be <= MAX_TICK_SPACING and >= MIN_TICK_SPACING |

### setDefaultPluginFactory

```solidity
function setDefaultPluginFactory(address newDefaultPluginFactory) external
```
**Selector**: `0x2939dd97`



*Developer note: updates pluginFactory address*

| Name | Type | Description |
| ---- | ---- | ----------- |
| newDefaultPluginFactory | address | address of new plugin factory |

### setVaultFactory

```solidity
function setVaultFactory(address newVaultFactory) external
```
**Selector**: `0x3ea7fbdb`



*Developer note: updates vaultFactory address*

| Name | Type | Description |
| ---- | ---- | ----------- |
| newVaultFactory | address | address of new vault factory |

### startRenounceOwnership

```solidity
function startRenounceOwnership() external
```
**Selector**: `0x469388c4`

Starts process of renounceOwnership. After that, a certain period
of time must pass before the ownership renounce can be completed.

### stopRenounceOwnership

```solidity
function stopRenounceOwnership() external
```
**Selector**: `0x238a1d74`

Stops process of renounceOwnership and removes timer.

### setDefaultBlastGovernor

```solidity
function setDefaultBlastGovernor(address defaultBlastGovernor_) external
```
**Selector**: `0x998709e0`



*Developer note: updates default blast governor address on the factory*

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultBlastGovernor_ | address | The new defautl blast governor address |

### setDefaultBlastPoints

```solidity
function setDefaultBlastPoints(address defaultBlastPoints_) external
```
**Selector**: `0x5f67e7bc`



*Developer note: updates default blast points address on the factory*

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultBlastPoints_ | address | The new defautl blast points address |

### setDefaultBlastPointsOperator

```solidity
function setDefaultBlastPointsOperator(address defaultBlastPointsOperator_) external
```
**Selector**: `0xe72b63de`



*Developer note: updates default blast points operator address on the factory*

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultBlastPointsOperator_ | address | The new defautl blast points operator address |

