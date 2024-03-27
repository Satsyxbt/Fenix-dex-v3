# Deployed Addresses List

Last updated date: **27.03.2024**

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
    "poolDeployer": "0xDC249b5Af938Ac700a973DEC8f08B631640C0f7E",
    "factory": "0x37f23c8371B01f044B22E2ec854895F9b44e80d0",
    "vault": "0xF684f9b771eB1F2091Aa74e43bA1edF31B2844c2",
    "vaultFactory": "0x93e1ca27705F741033F17ee3794c5b66d4e8De93",
    "AlgebraBasePluginV1": "0x3DF526734576650A103A608704eee8be51CEde94",
    "BasePluginV1Factory": "0xC65506ce86220685158cf87491A5994231A33E62",
    "wrapped": "0x4200000000000000000000000000000000000023",
    "tickLens": "0x123687Aa0fAb375D7AaDF47Be7bE1D204DEbF987",
    "quoter": "0x13fc9B642b0a8C54284967c207AC61B456dFF82B",
    "quoterV2": "0xf0e9Cd2F37c565adb33287aF7ecc0cAa5B742A6C",
    "swapRouter": "0x2E344c63ba4e72A13071Ffa9D552b6F3cAF78E49",
    "NFTDescriptor": "0x85FCb5B170BE3cf2a279EA1eB4d0556233c8a14E",
    "NonfungibleTokenPositionDescriptor": "0x4478Ff742c9B90d50E49C9e71d5558c015D1813b",
    "proxy": "0x105920Dc65a8343f49Fe1fca78ad75fC2D7c99a5",
    "nonfungiblePositionManager": "0x6b170BA012b15AC0294c5Ce2797eBe651b71F35A",
    "AlgebraInterfaceMulticall": "0x07Fa0eCc32E7A824c3a5f2771344608CA3cbD217",
    "eternal": "0x313E865510080B723338953a9dcAb7bf22444eD3",
    "fc": "0x6CE0e05DE600bE29B9ba68aE20C8Ab483D1a5Fa2"
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
2. `Setted FeesVault Factory` - `0xabc03eF501C3eeF03Bb0a1338653A8DfF7f1e36E`
3. Default BlastGovernor for v3 pairs - Deployer address
4. Default BlastPoints operator for v3 pairs - `0x5888eEe48C0173681109Be60396D75bA2c02f632`
5. Claimable mode for USDB and WETH tokens in pairs

#### Dex v3
- `INIT_DEFAULT_FEE: 0.05%`
- `MAX_DEFAULT_FEE: 4`
- `fee to FeesVault` - `10%`, `90%` to LP