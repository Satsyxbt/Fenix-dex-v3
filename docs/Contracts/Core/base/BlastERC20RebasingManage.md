

# BlastERC20RebasingManage


BlastERC20RebasingManage



*Developer note: Abstract contract designed to manage ERC20 rebasing tokens within the Blast ecosystem.
It provides functionalities to configure and claim tokens while ensuring that only authorized
entities can perform these operations.*

**Inherits:** [IBlastERC20RebasingManage](../interfaces/IBlastERC20RebasingManage.md)

## Functions
### configure

```solidity
function configure(address erc20Rebasing_, enum YieldMode mode_) external virtual returns (uint256)
```
**Selector**: `0x3bdbe9a5`



*Developer note: Configures the rebasing parameters of a specified ERC20 rebasing token.
This function can only be called by addresses with the required access permissions.
Implementations of this contract should ensure that the &#x60;_checkAccessForManageBlastERC20Rebasing&#x60;
function is called to enforce access control.*

| Name | Type | Description |
| ---- | ---- | ----------- |
| erc20Rebasing_ | address | The address of the ERC20 rebasing token to configure. |
| mode_ | enum YieldMode | The yield mode to apply to the token, determining how rebasing mechanics are handled. |

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | A uint256 value that represents the outcome of the configuration operation, which could be an updated token supply or another relevant metric, depending on the ERC20 rebasing token implementation. |

### claim

```solidity
function claim(address erc20Rebasing_, address recipient_, uint256 amount_) external virtual returns (uint256)
```
**Selector**: `0x996cba68`



*Developer note: Claims rebasing tokens on behalf of the caller and transfers them to a specified recipient.
This function can only be executed by addresses with the necessary access permissions.*

| Name | Type | Description |
| ---- | ---- | ----------- |
| erc20Rebasing_ | address | The address of the ERC20 rebasing token from which tokens are claimed. |
| recipient_ | address | The recipient address to receive the claimed tokens. |
| amount_ | uint256 | The amount of tokens to claim. |

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The result of the claim operation, specific to the ERC20 rebasing token implementation. |

