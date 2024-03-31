# Deployed Addresses List

Last updated date: **31.03.2024**

## Addresses
- `0x9140D359f2855E6540609dd4A93773ED1f45f509` - Deployer
- `0x5888eEe48C0173681109Be60396D75bA2c02f632` - BlastPoints operator

External:
- `0x4200000000000000000000000000000000000023` - WETH
- `0x4200000000000000000000000000000000000022` - USDB
- `0x4300000000000000000000000000000000000002` - BLAST
- `0x2fc95838c71e76ec69ff817983BFf17c710F34E0` - BlastPoints

## Deployed Contract Addresses
```js
{
    "poolDeployer": "0x383F8153913c2Da0769aCe87F20ED18A45f2E3C7",
    "factory": "0x242A0C57EAf78A061db42D913DE7FA4eA648a1Ef",
    "algebraFactoryImplementation": "0x12403d620C5930dA572Fe0ad2093886a9fa1d8c8",
    "proxyAdmin": "0x44b43b13052Ea0ff260d67F177d9932570Bd5C33",
    "vault": "0x3B82e2e3E94ff846E3396c98E4CC58841476bfaC",
    "vaultFactory": "0xD270BfCC3b8d3cfafd928205Ce0E785BbBcaAC3f",
    "AlgebraBasePluginV1": "0xad1cEDBCB23bfcf3333C36868D7c84d715FDf4A2",
    "BasePluginV1Factory": "0xc6366a42c28b81B45f9b7e41eC020D99fCA091E4",
    "wrapped": "0x4200000000000000000000000000000000000023",
    "tickLens": "0x810d612BD3929BA0D32D10629ef936E9cb88e0DB",
    "quoter": "0x17E7C69DAB4BDB0C09E0AD50F5D485a5C6703DF3",
    "quoterV2": "0xB8268aCcf3e3964f61917D5e0E8Eaa654551F99A",
    "swapRouter": "0xD952ACb88D36029A388555c19AA7031182f98932",
    "NFTDescriptor": "0x2E9BeF53912635833b54f563D815080ec57E55c1",
    "NonfungibleTokenPositionDescriptor": "0xa75367FE949BFc07Cf780AFf31ecAE50f5BB08Ef",
    "proxy": "0x1Ca6fC2f8C653cD2dbF3119930C0656f783363fB",
    "nonfungiblePositionManager": "0x36F9FE7b35bDB44e84DAE4eF9197d6441Aac048a",
    "AlgebraInterfaceMulticall": "0xAcC8A48151061f60bA4AA6FA955305360158E840",
    "eternal": "0x23d794a2E7A0505B2cE7fe3cDd0D486b615aea89",
    "fc": "0x6bDE4274aa698a13AD93D8732F9D9D05a94054DA"
}
```

### Blast governor
| Contract Name                       | Current Gas Mode | BlastGovernor Address                |
|-------------------------------------|------------------|--------------------------------------|
| Pool Deployer                       | Claimable        | `0x9140D359f2855E6540609dd4A93773ED1f45f509` |
| Factory                             | Claimable        | `0x9140D359f2855E6540609dd4A93773ED1f45f509` |
| Vault                               | Claimable        | `0x9140D359f2855E6540609dd4A93773ED1f45f509` |
| Vault Factory                       | Claimable        | `0x9140D359f2855E6540609dd4A93773ED1f45f509` |
| Base Plugin V1 Factory              | Claimable        | `0x9140D359f2855E6540609dd4A93773ED1f45f509` |
| Quoter                              | Claimable        | `0x9140D359f2855E6540609dd4A93773ED1f45f509` |
| Quoter V2                           | Claimable        | `0x9140D359f2855E6540609dd4A93773ED1f45f509` |
| Swap Router                         | Claimable        | `0x9140D359f2855E6540609dd4A93773ED1f45f509` |
| Non-fungible Position Manager       | Claimable        | `0x9140D359f2855E6540609dd4A93773ED1f45f509` |
| Algebra Interface Multicall         | Claimable        | `0x9140D359f2855E6540609dd4A93773ED1f45f509` |
| Eternal                             | Claimable        | `0x9140D359f2855E6540609dd4A93773ED1f45f509` |
| FC                                  | Claimable        | `0x9140D359f2855E6540609dd4A93773ED1f45f509` |



### Other settings
#### General
1. `Creating pools v3` - permissionessly
2. `Setted FeesVault Factory` - `0xa3103248290399cc2655b68f0038ce590ce8639E`
3. Default BlastGovernor for v3 pairs - Deployer address
4. Default BlastPoints operator for v3 pairs - `0x5888eEe48C0173681109Be60396D75bA2c02f632`
5. Claimable mode for USDB and WETH tokens in v3 pools

#### Dex v3
- `INIT_DEFAULT_FEE: 0.05%`
- `MAX_DEFAULT_FEE: 4`
- `fee to FeesVault` - `10%`, `90%` to LP