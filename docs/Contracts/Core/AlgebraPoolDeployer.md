

# AlgebraPoolDeployer


Algebra pool deployer

Is used by AlgebraFactory to deploy pools

*Developer note: Version: Algebra Integral 1.0*

**Inherits:** [IAlgebraPoolDeployer](interfaces/IAlgebraPoolDeployer.md) [BlastGovernorSetup](base/BlastGovernorSetup.md)

## Functions
### constructor

```solidity
constructor(address _blastGovernor, address _factory) public
```



| Name | Type | Description |
| ---- | ---- | ----------- |
| _blastGovernor | address |  |
| _factory | address |  |

### getDeployParameters

```solidity
function getDeployParameters() external view returns (address _blastGovernor, address _blastPoints, address _blastPointsOperator, address _plugin, address _factory, address _token0, address _token1)
```
**Selector**: `0x04889e26`

Get the parameters to be used in constructing the pool, set transiently during pool creation.

*Developer note: Called by the pool constructor to fetch the parameters of the pool*

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _blastGovernor | address |  |
| _blastPoints | address |  |
| _blastPointsOperator | address |  |
| _plugin | address |  |
| _factory | address |  |
| _token0 | address |  |
| _token1 | address |  |

### deploy

```solidity
function deploy(address blastGovernor, address blastPoints, address blastPointsOperator, address plugin, address token0, address token1) external returns (address pool)
```
**Selector**: `0x0bcf6b4c`



*Developer note: Deploys a pool with the given parameters by transiently setting the parameters in cache.*

| Name | Type | Description |
| ---- | ---- | ----------- |
| blastGovernor | address | The blast governor address for set to Blast ecosystem contract |
| blastPoints | address | The address of the Blast Points contract, used for managing points within the ecosystem. |
| blastPointsOperator | address | The address of the operator authorized to manage points in the Blast Points contract. |
| plugin | address | The pool associated plugin (if any) |
| token0 | address | The first token of the pool by address sort order |
| token1 | address | The second token of the pool by address sort order |

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | The deployed pool's address |

