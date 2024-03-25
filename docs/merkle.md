## NonFungiblePositionManager (or equivalent contract to handle positions) ABI below:

Links for abi:
- `https://api.blastscan.io/api?module=contract&action=getabi&address=0x423D6c1440C7DA8A59E97e4d6Ed96b1BF706f67a`
- `https://blastexplorer.io/address/0x423D6c1440C7DA8A59E97e4d6Ed96b1BF706f67a/contract/81457/code`

or abi in json file format:
- [NonFungiblePositionManager.abi.json](./NonFungiblePositionManager.abi.json)

## List specificities of contracts in comparison with UniswapV3 contracts (for instance position structures, fee structures, events emitted):

### Source code
The Fenix version is based on Algebra Integral v1.0
- `https://github.com/cryptoalgebra/Algebra/releases/tag/v1.0-integral`
 
Source code for our implementations:
- **AlgebraFactory** - https://github.com/Satsyxbt/Fenix-dex-v3/blob/blast-mainnet-release-v1.0/src/core/contracts/AlgebraFactory.sol

- **AlgebraFactory** - https://github.com/Satsyxbt/Fenix-dex-v3/blob/blast-mainnet-release-v1.0/src/core/contracts/AlgebraPool.sol

- **NonfungiblePositionManager** - https://github.com/Satsyxbt/Fenix-dex-v3/blob/blast-mainnet-release-v1.0/src/periphery/contracts/NonfungiblePositionManager.sol


### Documentation describing methods, structs and events

- https://github.com/Satsyxbt/Fenix-dex-v3/blob/blast-mainnet-release-v1.0/docs/Contracts/Core/interfaces/IAlgebraFactory.md
- https://github.com/Satsyxbt/Fenix-dex-v3/blob/blast-mainnet-release-v1.0/docs/Contracts/Core/interfaces/pool/IAlgebraPoolEvents.md
- https://github.com/Satsyxbt/Fenix-dex-v3/blob/blast-mainnet-release-v1.0/docs/Contracts/Periphery/interfaces/INonfungiblePositionManager.md
  

### Specificities
More about the features in the documentation: https://docs.algebra.finance/algebra-integral-documentation

#### Factory
- Pools are no longer split pools for the same tokens by `fee` or `tickSpacing`
- Only a single pool can be created for a pair of token0 and token1
- TickSpacing of the pool can be changed
- The fee is dynamic and can also be changed
  
##### Events
- `event Pool(address indexed token0, address indexed token1, address pool)` - the event is emitted when a new pool is created


#### NonFungibleManager 

##### functions
[Returns the position information associated with a given token ID.](https://github.com/Satsyxbt/Fenix-dex-v3/blob/blast-mainnet-release-v1.0/docs/Contracts/Periphery/interfaces/INonfungiblePositionManager.md#positions)
```js
function positions(uint256 tokenId) external view returns (uint88 nonce, address operator, address token0, address token1, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)
``` 

##### Events
- `event IncreaseLiquidity(uint256 tokenId, uint128 liquidityDesired, uint128 actualLiquidity, uint256 amount0, uint256 amount1, address pool)` - Emitted when liquidity is increased for a position NFT
- `event DecreaseLiquidity(uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)` - Emitted when liquidity is decreased for a position NFT

### AlgebraPool

- Absence of slot0, replaced by globalState
- Changing the approach to charging fees to users, by default 100% goes to FeesVault
- Dynamic fee
   
#### Events
- `event Mint(address sender, address owner, int24 bottomTick, int24 topTick, uint128 liquidityAmount, uint256 amount0, uint256 amount1)` - Emitted when liquidity is minted for a given position
  
- `event Burn(address owner, int24 bottomTick, int24 topTick, uint128 liquidityAmount, uint256 amount0, uint256 amount1)` - Emitted when a position's liquidity is removed


- `event Swap(address sender, address recipient, int256 amount0, int256 amount1, uint160 price, uint128 liquidity, int24 tick)` - Emitted by the pool for any swaps between token0 and token1
