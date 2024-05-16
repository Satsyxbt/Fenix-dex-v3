

# IModeSfsSetupFactoryManager


IModeSfsSetupFactoryManager



*Developer note: Interface for the Mode Sfs Setup Factory Manager.*


## Events
### DefaultModeSfs

```solidity
event DefaultModeSfs(address defaultModeSfs)
```



*Developer note: Emitted when the default Mode SFS address is set.*

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultModeSfs | address | The new default Mode SFS address. |

### DefaultSfsAssignTokenId

```solidity
event DefaultSfsAssignTokenId(uint256 defaultSfsAssignTokenId)
```



*Developer note: Emitted when the default SFS assign token ID is set.*

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultSfsAssignTokenId | uint256 | The new default SFS assign token ID. |


## Functions
### setDefaultModeSfs

```solidity
function setDefaultModeSfs(address defaultModeSfs_) external
```
**Selector**: `0xe15a1d15`



*Developer note: Sets the default Mode SFS address.

Requirements:
- The caller must have the appropriate access permissions.
- &#x60;defaultModeSfs_&#x60; cannot be the zero address.*

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultModeSfs_ | address | The new default Mode SFS address. |

### setDefaultSfsAssignTokenId

```solidity
function setDefaultSfsAssignTokenId(uint256 defaultSfsAssignTokenId_) external
```
**Selector**: `0x4b599f48`



*Developer note: Sets the default SFS assign token ID.

Requirements:
- The caller must have the appropriate access permissions.
- &#x60;defaultSfsAssignTokenId_&#x60; must be greater than zero.*

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultSfsAssignTokenId_ | uint256 | The new default SFS assign token ID. |

### defaultModeSfs

```solidity
function defaultModeSfs() external view returns (address)
```
**Selector**: `0x3619d5f0`



**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the default Mode SFS contract. |

### defaultSfsAssignTokenId

```solidity
function defaultSfsAssignTokenId() external view returns (uint256)
```
**Selector**: `0x3142fcae`



**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The token ID of the default SFS assign token. |

