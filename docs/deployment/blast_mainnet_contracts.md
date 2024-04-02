# Deployed Contracts
Last updated date: **02.04.2024**

## Addresses
- `0x4867664BaAFE5926B3cA338e96c88fB5a5FeAb30` - Deployer
- `0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4` - Default/Setted blast points operator address
- `0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4` - Default/Setted blast governor address

External:
- `0x4300000000000000000000000000000000000004` - WETH
- `0x4300000000000000000000000000000000000003` - USDB
- `0x4300000000000000000000000000000000000002` - BLAST
- `0x2536FE9ab3F511540F2f9e2eC2A805005C3Dd800` - BlastPoints


## Deployed Contract Addresses
| Contract Type                         | Address                                      |
|---------------------------------------|----------------------------------------------|
| Pool Deployer                         | `0x5aCCAc55f692Ae2F065CEdDF5924C8f6B53cDaa8` |
| AlgebraFactory                        | `0x7a44CD060afC1B6F4c80A2B9b37f4473E74E25Df` |
| AlgebraFactory Implementation         | `0xab8edDD8193eE4A5459f4245eAc980279774a278` |
| ProxyAdmin                            | `0xA1DA767b77FdfF57A7D8191861d73ac02Bbd5696` |
| AlgebraBasePluginV1 Implementation    | `0x87F6AF89Ab8F6E11f06cf76b17F2208255247013` |
| BasePluginV1Factory                   | `0x118A7D61bd36215a01Ab8A29Eb1e5b830c32FA23` |
| Tick Lens                             | `0x098cB852107a0b4508664C09917c00dcb0745aa9` |
| Quoter                                | `0x79F92b0b4ca9aDA848E21Cd1460b12286141cc25` |
| Quoter V2                             | `0x94Ca5B835186A37A99776780BF976fAB81D84ED8` |
| Swap Router                           | `0x2df37Cb897fdffc6B4b03d8252d85BE7C6dA9d00` |
| NFT Descriptor                        | `0x67EE08c196a57BDE59f8c37F53637f59b279E1fB` |
| Nonfungible Token Position Descriptor | `0x01e4DbCf3cB4A16c36F79ff2ac401B0211653395` |
| Proxy                                 | `0xaF38383e3e2E81C829240C6c52893981E9aa38b6` |
| Non-fungible Position Manager         | `0x8881b3Fb762d1D50e6172f621F107E24299AA1Cd` |
| Algebra Interface Multicall           | `0x85aD1e30B5d7F698DCe27468a1eD95922dC66f1f` |
| AlgebraEternalFarming                 | `0xE8B7B02C5FC008f92d6f2E194A1efaF8C4D726A8` |
| FarmingCenter                         | `0x12370808147b2111516250A3b9A2ab66C70845E1` |

### Contracts that are disabled
These contracts are not used as their role is played by `FeesVault`, `FeesVaultFactory`
| Contract Type           | Address                                      |
|-------------------------|----------------------------------------------|
| AlgebraVaultFactoryStub | `0x9D1B06E6aE2A5403eA07E131c0603eDBDC67992B` |
| AlgebraCommunityVault   | `0xA217EA054466e4f4cE5B994B193eBcdFcf1d459C` |


## Blast configuration
### Blast governor
| Contract Name                       | Current Gas Mode | Current ETH Yield Mode | Blast governor Address                 |
|-------------------------------------|------------------|------------------|----------------------------------------------|
| Pool Deployer                       | Claimable        | Claimable        | `0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4` |
| Factory                             | Claimable        | Claimable        | `0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4` |
| Vault                               | Claimable        | Claimable        | `0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4` |
| Vault Factory                       | Claimable        | Claimable        | `0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4` |
| Base Plugin V1 Factory              | Claimable        | Claimable        | `0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4` |
| Quoter                              | Claimable        | Claimable        | `0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4` |
| Quoter V2                           | Claimable        | Claimable        | `0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4` |
| Swap Router                         | Claimable        | Claimable        | `0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4` |
| Non-fungible Position Manager       | Claimable        | Claimable        | `0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4` |
| Algebra Interface Multicall         | Claimable        | Claimable        | `0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4` |
| AlgebraEternalFarming               | Claimable        | Claimable        | `0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4` |
| FarmingCenter                       | Claimable        | Claimable        | `0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4` |

### Default blast governor
Seted the address that will be set when deploys contracts (pools, plug-ins, etc.) from the specified contracts
| Contract Name                       | Blast governor Address              |
|-------------------------------------|----------------------------------------------|
| AlgebraFactory                      | `0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4` |
| AlgebraEternalFarming               | `0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4` |
| BasePluginV1Factory                 | `0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4` |

### Default blast points operator
Seted the address that will be set when deploying new pools as an operator for blast points of this pool
| Contract Name                       | Blast governor Address              |
|-------------------------------------|----------------------------------------------|
| AlgebraFactory                      | `0xb279Cb42Ab3d598Eb3A864399C11a52a5f506bA4` |

## Initial/Default settings
#### General
- Public Pool Creation Mode: `false`
- Default Community Fee: `10` => 10%
- Default Fee: `500` => 0.05%
- Default Tickspacing: `60`
- Setted FeesVault Factory: `0x25D84140b5a611Fc8b13B0a73b7ac86d30C81edB`
- WETH: `isRebase: true, mode: Clamable`
- USDB: `isRebase: true, mode: Clamable`
- Default dynamic fee configuration:
  ```js
  {
    
        alpha1: 2900, // max value of the first sigmoid in hundredths of a bip, i.e. 1e-6
        alpha2: 15000 - 3000, // max value of the second sigmoid in hundredths of a bip, i.e. 1e-6
        beta1: 360, // shift along the x-axis (volatility) for the first sigmoid
        beta2: 60000, // shift along the x-axis (volatility) for the second sigmoid
        gamma1: 59, // horizontal stretch factor for the first sigmoid
        gamma2: 8500, // horizontal stretch factor for the second sigmoid
        baseFee: 100 // in hundredths of a bip, i.e. 1e-6
    }
    ```

#### Others constants/parameters
- FLASH_FEE: `100` => 0.01%
- MAX_DEFAULT_FEE: `50000` => 5%
- MIN_TICK_SPACING: `1`
- MAX_TICK_SPACING: `500`
- MAX_COMMUNITY_FEE: `100` => 100% #swap fees to fee vault
- COMMUNITY_FEE_TRANSFER_FREQUENCY: `1 hours`
  