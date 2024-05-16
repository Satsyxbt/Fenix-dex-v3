

# AlgebraPoolDeployer


Algebra pool deployer

Is used by AlgebraFactory to deploy pools

*Developer note: Version: Algebra Integral 1.0*

**Inherits:** [IAlgebraPoolDeployer](interfaces/IAlgebraPoolDeployer.md) [ModeSfsSetup](base/ModeSfsSetup.md)

## Functions
### constructor

```solidity
constructor(address _modeSfs, uint256 _sfsAssignTokenId, address _factory) public
```



| Name | Type | Description |
| ---- | ---- | ----------- |
| _modeSfs | address |  |
| _sfsAssignTokenId | uint256 |  |
| _factory | address |  |

### getDeployParameters

```solidity
function getDeployParameters() external view returns (address _modeSfs, uint256 _sfsAssignTokenId, address _plugin, address _factory, address _token0, address _token1)
```
**Selector**: `0x04889e26`

Get the parameters to be used in constructing the pool, set transiently during pool creation.

*Developer note: Called by the pool constructor to fetch the parameters of the pool*

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _modeSfs | address |  |
| _sfsAssignTokenId | uint256 |  |
| _plugin | address |  |
| _factory | address |  |
| _token0 | address |  |
| _token1 | address |  |

### deploy

```solidity
function deploy(address modeSfs, uint256 sfsAssignTokenId, address plugin, address token0, address token1) external returns (address pool)
```
**Selector**: `0x09b01d0f`



*Developer note: Deploys a pool with the given parameters by transiently setting the parameters in cache.
 @param modeSfs Address of the Mode SFS contract.
 @param sfsAssignTokenId The token ID for SFS assignment.*

| Name | Type | Description |
| ---- | ---- | ----------- |
| modeSfs | address |  |
| sfsAssignTokenId | uint256 |  |
| plugin | address | The pool associated plugin (if any) |
| token0 | address | The first token of the pool by address sort order |
| token1 | address | The second token of the pool by address sort order |

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | The deployed pool's address |

