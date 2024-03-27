

# FaultyVaultFactoryStub


Algebra vault factory stub

This contract is used to set AlgebraCommunityVault as communityVault in new pools

**Inherits:** [IAlgebraVaultFactory](../interfaces/vault/IAlgebraVaultFactory.md)

## Events
### AfterPoolInitialize__Test

```solidity
event AfterPoolInitialize__Test(address caller, address pool)
```



| Name | Type | Description |
| ---- | ---- | ----------- |
| caller | address |  |
| pool | address |  |


## Public variables
### defaultAlgebraCommunityVault
```solidity
address immutable defaultAlgebraCommunityVault
```
**Selector**: `0xb7a85452`

the address of AlgebraCommunityVault



## Functions
### constructor

```solidity
constructor(address _algebraCommunityVault) public
```



| Name | Type | Description |
| ---- | ---- | ----------- |
| _algebraCommunityVault | address |  |

### getVaultForPool

```solidity
function getVaultForPool(address) external view returns (address)
```
**Selector**: `0x7570e389`

returns address of the community fee vault for the pool

| Name | Type | Description |
| ---- | ---- | ----------- |
|  | address |  |

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address |  |

### createVaultForPool

```solidity
function createVaultForPool(address) external view returns (address)
```
**Selector**: `0xcbc48015`

creates the community fee vault for the pool if needed

| Name | Type | Description |
| ---- | ---- | ----------- |
|  | address |  |

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address |  |

### afterPoolInitialize

```solidity
function afterPoolInitialize(address pool) external
```
**Selector**: `0x12e3b4d1`

Hook for calling after pool deployment

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | the address of Algebra Integral pool |

