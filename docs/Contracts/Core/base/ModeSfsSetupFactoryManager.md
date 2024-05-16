

# ModeSfsSetupFactoryManager


ModeSfsSetupFactoryManager



*Developer note: Abstract contract that manages the setup and configuration of Mode SFS.
Inherits from &#x60;ModeSfsSetup&#x60; and implements &#x60;IModeSfsSetupFactoryManager&#x60;.*

**Inherits:** [IModeSfsSetupFactoryManager](../interfaces/IModeSfsSetupFactoryManager.md) [ModeSfsSetup](ModeSfsSetup.md)

## Public variables
### defaultModeSfs
```solidity
address defaultModeSfs
```
**Selector**: `0x3619d5f0`




### defaultSfsAssignTokenId
```solidity
uint256 defaultSfsAssignTokenId
```
**Selector**: `0x3142fcae`





## Functions
### setDefaultModeSfs

```solidity
function setDefaultModeSfs(address defaultModeSfs_) external virtual
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
function setDefaultSfsAssignTokenId(uint256 defaultSfsAssignTokenId_) external virtual
```
**Selector**: `0x4b599f48`



*Developer note: Sets the default SFS assign token ID.

Requirements:
- The caller must have the appropriate access permissions.
- &#x60;defaultSfsAssignTokenId_&#x60; must be greater than zero.*

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultSfsAssignTokenId_ | uint256 | The new default SFS assign token ID. |

