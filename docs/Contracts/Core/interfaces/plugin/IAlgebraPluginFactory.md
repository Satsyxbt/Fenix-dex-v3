

# IAlgebraPluginFactory


An interface for a contract that is capable of deploying Algebra plugins



*Developer note: Such a factory is needed if the plugin should be automatically created and connected to each new pool*


## Functions
### createPlugin

```solidity
function createPlugin(address pool, address token0, address token1) external returns (address)
```
**Selector**: `0x9533ff10`

Deploys new plugin contract for pool

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | The address of the pool for which the new plugin will be created |
| token0 | address | First token of the pool |
| token1 | address | Second token of the pool |

**Returns:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | New plugin address |

