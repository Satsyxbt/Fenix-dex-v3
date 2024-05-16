

# BasePluginV1Factory


Algebra Integral 1.0 default plugin factory

This contract creates Algebra default plugins for Algebra liquidity pools

**Inherits:** [IBasePluginV1Factory](interfaces/IBasePluginV1Factory.md) [ModeSfsSetupFactoryManager](../Core/base/ModeSfsSetupFactoryManager.md)
## Modifiers
### onlyAdministrator

```solidity
modifier onlyAdministrator()
```




## Public variables
### ALGEBRA_BASE_PLUGIN_FACTORY_ADMINISTRATOR
```solidity
bytes32 constant ALGEBRA_BASE_PLUGIN_FACTORY_ADMINISTRATOR = 0x267da724c255813ae00f4522fe843cb70148a4b8099cbc5af64f9a4151e55ed6
```
**Selector**: `0xcddff269`

The hash of &#x27;ALGEBRA_BASE_PLUGIN_FACTORY_ADMINISTRATOR&#x27; used as role

*Developer note: allows to change settings of BasePluginV1Factory*

### algebraFactory
```solidity
address immutable algebraFactory
```
**Selector**: `0xa7b64b04`

Returns the address of AlgebraFactory


### defaultFeeConfiguration
```solidity
struct AlgebraFeeConfiguration defaultFeeConfiguration
```
**Selector**: `0x4e09a96a`

Current default dynamic fee configuration

*Developer note: See the AdaptiveFee struct for more details about params.
This value is set by default in new plugins*

### farmingAddress
```solidity
address farmingAddress
```
**Selector**: `0x8a2ade58`

Returns current farming address


### implementation
```solidity
address implementation
```
**Selector**: `0x5c60da1b`



*Developer note: Must return an address that can be used as a delegate call target.

{BeaconProxy} will check that this address is a contract.*

### pluginByPool
```solidity
mapping(address => address) pluginByPool
```
**Selector**: `0xcdef16f6`

Returns address of plugin created for given AlgebraPool



## Functions
### constructor

```solidity
constructor(address _modeSfs, uint256 _sfsAssignTokenId, address _algebraFactory, address _basePluginV1Implementation) public
```



| Name | Type | Description |
| ---- | ---- | ----------- |
| _modeSfs | address |  |
| _sfsAssignTokenId | uint256 |  |
| _algebraFactory | address |  |
| _basePluginV1Implementation | address |  |

### createPlugin

```solidity
function createPlugin(address pool, address, address) external returns (address)
```
**Selector**: `0x9533ff10`



| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address |  |
|  | address |  |
|  | address |  |

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address |  |

### createPluginForExistingPool

```solidity
function createPluginForExistingPool(address token0, address token1) external returns (address)
```
**Selector**: `0x27733026`

Create plugin for already existing pool

| Name | Type | Description |
| ---- | ---- | ----------- |
| token0 | address | The address of first token in pool |
| token1 | address | The address of second token in pool |

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of created plugin |

### setDefaultFeeConfiguration

```solidity
function setDefaultFeeConfiguration(struct AlgebraFeeConfiguration newConfig) external
```
**Selector**: `0xf718949a`

Changes initial fee configuration for new pools

*Developer note: changes coefficients for sigmoids: α / (1 + e^( (β-x) / γ))
alpha1 + alpha2 + baseFee (max possible fee) must be &lt;&#x3D; type(uint16).max and gammas must be &gt; 0*

| Name | Type | Description |
| ---- | ---- | ----------- |
| newConfig | struct AlgebraFeeConfiguration | new default fee configuration. See the #AdaptiveFee.sol library for details |

### setFarmingAddress

```solidity
function setFarmingAddress(address newFarmingAddress) external
```
**Selector**: `0xb001f618`



*Developer note: updates farmings manager address on the factory*

| Name | Type | Description |
| ---- | ---- | ----------- |
| newFarmingAddress | address | The new tokenomics contract address |

### upgradeTo

```solidity
function upgradeTo(address newImplementation) external
```
**Selector**: `0x3659cfe6`



*Developer note: Upgrades the beacon to a new implementation.

Emits an {Upgraded} event.

Requirements:

- msg.sender must be the plugin adminisrator.
- &#x60;newImplementation&#x60; must be a contract.*

| Name | Type | Description |
| ---- | ---- | ----------- |
| newImplementation | address |  |

