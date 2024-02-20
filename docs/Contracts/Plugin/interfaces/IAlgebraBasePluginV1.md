

# IAlgebraBasePluginV1


The interface for the AlgebraBasePluginV1

This contract combines the standard implementations of the volatility oracle and the dynamic fee manager

*Developer note: This contract stores timepoints and calculates adaptive fee and statistical averages*

**Inherits:** [IVolatilityOracle](plugins/IVolatilityOracle.md) [IDynamicFeeManager](plugins/IDynamicFeeManager.md) [IFarmingPlugin](plugins/IFarmingPlugin.md)

## Functions
### initialize

```solidity
function initialize() external
```
**Selector**: `0x8129fc1c`

Initialize the plugin externally

*Developer note: This function allows to initialize the plugin if it was created after the pool was created*

### initialize

```solidity
function initialize(address _blastGovernor, address _pool, address _factory, address _pluginFactory) external
```
**Selector**: `0xf8c8765e`

Initialize the plugin instead of the constructor flow, for proxy

*Developer note: This function allows to initialize the plugin if it was created like proxy*

| Name | Type | Description |
| ---- | ---- | ----------- |
| _blastGovernor | address |  |
| _pool | address |  |
| _factory | address |  |
| _pluginFactory | address |  |

