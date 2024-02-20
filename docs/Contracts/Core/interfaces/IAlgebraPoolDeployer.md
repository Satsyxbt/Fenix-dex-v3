

# IAlgebraPoolDeployer


An interface for a contract that is capable of deploying Algebra Pools

A contract that constructs a pool must implement this to pass arguments to the pool

*Developer note: This is used to avoid having constructor arguments in the pool contract, which results in the init code hash
of the pool being constant allowing the CREATE2 address of the pool to be cheaply computed on-chain.
Credit to Uniswap Labs under GPL-2.0-or-later license:
https://github.com/Uniswap/v3-core/tree/main/contracts/interfaces*


## Functions
### getDeployParameters

```solidity
function getDeployParameters() external view returns (address blastGovernor, address plugin, address factory, address token0, address token1)
```
**Selector**: `0x04889e26`

Get the parameters to be used in constructing the pool, set transiently during pool creation.

*Developer note: Called by the pool constructor to fetch the parameters of the pool*

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| blastGovernor | address | The blastgovernro address for set in Blast ecosystem contract |
| plugin | address | The pool associated plugin (if any) |
| factory | address | The Algebra Factory address |
| token0 | address | The first token of the pool by address sort order |
| token1 | address | The second token of the pool by address sort order |

### deploy

```solidity
function deploy(address blastGovernor, address plugin, address token0, address token1) external returns (address pool)
```
**Selector**: `0xfd82b73a`



*Developer note: Deploys a pool with the given parameters by transiently setting the parameters in cache.*

| Name | Type | Description |
| ---- | ---- | ----------- |
| blastGovernor | address | The blast governor address for set to Blast ecosystem contract |
| plugin | address | The pool associated plugin (if any) |
| token0 | address | The first token of the pool by address sort order |
| token1 | address | The second token of the pool by address sort order |

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | The deployed pool's address |

