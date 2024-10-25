const path = require('path');
const config = require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { ETHERSCAN_API_KEY, BSCSCAN_API_KEY, POLYGONSCAN_API_KEY, MNEMONIC, DEPLOY_GAS_LIMIT_MAX, DEPLOY_GAS_PRICE, INFURA_ID_PROJECT, API_KEY } =
  config.parsed || {};

export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      loggingEnabled: false,
      evm: 'paris',
    },
    localhost: {
      url: `http://127.0.0.1:8545`,
      accounts: [`0x${MNEMONIC || '1000000000000000000000000000000000000000000000000000000000000000'}`],
    },
    localHardhat: {
      url: `http://127.0.0.1:8545`,
    },
    localGeth: {
      url: `http://127.0.0.1:8545`,
      chainId: 1337,
      gas: 10000000,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_ID_PROJECT}`,
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${INFURA_ID_PROJECT}`,
      chainId: 3,
      accounts: [`0x${MNEMONIC || '1000000000000000000000000000000000000000000000000000000000000000'}`],
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_ID_PROJECT}`,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_ID_PROJECT}`,
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${INFURA_ID_PROJECT}`,
      chainId: 42,
      accounts: [`0x${MNEMONIC || '1000000000000000000000000000000000000000000000000000000000000000'}`],
      gasPrice: 8000000000,
    },
    bscTestnet: {
      url: `https://data-seed-prebsc-2-s3.binance.org:8545`,
      chainId: 97,
      accounts: [`0x${MNEMONIC || '1000000000000000000000000000000000000000000000000000000000000000'}`],
    },
    bsc: {
      url: `https://bsc-dataseed3.binance.org`,
    },
    mumbai: {
      url: `https://polygon-mumbai-bor.publicnode.com`,
      chainId: 80001,
      accounts: [`0x${MNEMONIC || '1000000000000000000000000000000000000000000000000000000000000000'}`],
    },
    mantleTestnet: {
      url: `https://rpc.testnet.mantle.xyz`,
      chainId: 5001,
      accounts: [`0x${MNEMONIC || '1000000000000000000000000000000000000000000000000000000000000000'}`],
    },
    mantle: {
      url: `https://rpc.mantle.xyz`,
      chainId: 5000,
      accounts: [`0x${MNEMONIC || '1000000000000000000000000000000000000000000000000000000000000000'}`],
    },
    telosTestnet: {
      url: `https://testnet.telos.net/evm`,
      chainId: 41,
      accounts: [`0x${MNEMONIC || '1000000000000000000000000000000000000000000000000000000000000000'}`],
    },
    maticMainnet: {
      url: `https://rpc-mainnet.matic.quiknode.pro`,
      chainId: 137,
      accounts: [`0x${MNEMONIC || '1000000000000000000000000000000000000000000000000000000000000000'}`],
      gasPrice: 50_000_000_000,
    },
    artheraTestnet: {
      url: `https://rpc-test.arthera.net`,
      chainId: 10243,
      accounts: [`0x${MNEMONIC || '1000000000000000000000000000000000000000000000000000000000000000'}`],
    },
    blastScanSepolia: {
      url: `https://blast-sepolia.infura.io/v3/${INFURA_ID_PROJECT}`,
      gasPrice: 1e3,
      accounts: [`0x${MNEMONIC || '1000000000000000000000000000000000000000000000000000000000000000'}`],
    },
    blastSepolia: {
      url: `https://blast-sepolia.infura.io/v3/${INFURA_ID_PROJECT}`,
      gasPrice: 1e3,
      accounts: [`0x${MNEMONIC || '1000000000000000000000000000000000000000000000000000000000000000'}`],
    },
    blastMainnet: {
      url: `https://blast-mainnet.infura.io/v3/${INFURA_ID_PROJECT}`,
      gasPrice: 1e3,
      accounts: [`0x${MNEMONIC || '1000000000000000000000000000000000000000000000000000000000000000'}`],
    },
    blastScanMainnet: {
      url: `https://blast-mainnet.infura.io/v3/${INFURA_ID_PROJECT}`,
      gasPrice: 1e3,
      accounts: [`0x${MNEMONIC || '1000000000000000000000000000000000000000000000000000000000000000'}`],
    },
  },
  etherscan: {
    apiKey: {
      blastSepolia: 'blastSepolia', // apiKey is not required, just set a placeholder
      blastMainnet: 'blastMainnet',
      blastScanMainnet: `${API_KEY}`,
      blastScanSepolia: `${API_KEY}`,
    },
    customChains: [
      {
        network: 'blastScanSepolia',
        chainId: 168587773,
        urls: {
          apiURL: 'https://api-sepolia.blastscan.io/api',
          browserURL: 'https://sepolia.blastscan.io/',
        },
      },
      {
        network: 'blastMainnet',
        chainId: 81457,
        urls: {
          apiURL: 'https://api.routescan.io/v2/network/mainnet/evm/81457/etherscan',
          browserURL: 'https://blastexplorer.io',
        },
      },
      {
        network: 'blastScanMainnet',
        chainId: 81457,
        urls: {
          apiURL: 'https://api.blastscan.io/api',
          browserURL: 'https://blastscan.io/',
        },
      },
      {
        network: 'blastSepolia',
        chainId: 168587773,
        urls: {
          apiURL: 'https://api.routescan.io/v2/network/testnet/evm/168587773/etherscan',
          browserURL: 'https://testnet.blastscan.io',
        },
      },
      {
        network: 'mantleTestnet',
        chainId: 5001,
        urls: {
          apiURL: 'https://explorer.testnet.mantle.xyz/api',
          browserURL: 'https://explorer.testnet.mantle.xyz/',
        },
      },
      {
        network: 'mantle',
        chainId: 5000,
        urls: {
          apiURL: 'https://explorer.mantle.xyz/api',
          browserURL: 'https://explorer.mantle.xyz/',
        },
      },
    ],
  },
};
