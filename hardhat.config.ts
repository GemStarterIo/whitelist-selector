import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";
import "./tasks/accounts";
import "./tasks/clean";

import "@nomiclabs/hardhat-waffle";
import "hardhat-typechain";
import "solidity-coverage";
import "hardhat-watcher";
import "hardhat-abi-exporter";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const chainIds = {
  localhost: 1337,
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
  bsc: 56,
  bsctestnet: 97,
  polygon: 137,
  xdai: 100,
  mumbai: 80001,
};

// Ensure that we have all the environment variables we need.
let mnemonic: string;
if (!process.env.MNEMONIC) {
  throw new Error("Please set your MNEMONIC in a .env file");
} else {
  mnemonic = process.env.MNEMONIC;
}

let infuraApiKey: string;
if (!process.env.INFURA_API_KEY) {
  throw new Error("Please set your INFURA_API_KEY in a .env file");
} else {
  infuraApiKey = process.env.INFURA_API_KEY;
}

function createConfig(network: keyof typeof chainIds): NetworkUserConfig {
  const url: string = "https://" + network + ".infura.io/v3/" + infuraApiKey;
  return {
    accounts: {
      count: 10,
      initialIndex: 2,
      mnemonic,
      path: "m/44'/60'/0'/0",
    },
    chainId: chainIds[network],
    url,
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: chainIds.hardhat,
      accounts: {
        count: 10,
        initialIndex: 0,
        mnemonic,
        path: "m/44'/60'/0'/0",
      },
    },
    localhost: {
      accounts: {
        count: 10,
        initialIndex: 0,
        mnemonic,
        path: "m/44'/60'/0'/0",
      },
    },
    bsctestnet: {
      chainId: chainIds.bsctestnet,
      accounts: {
        count: 10,
        initialIndex: 0,
        mnemonic,
        path: "m/44'/60'/0'/0",
      },
      gasPrice: 20000000000,
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
    },
    bsc: {
      chainId: chainIds.bsc,
      accounts: {
        count: 10,
        initialIndex: 0,
        mnemonic,
        path: "m/44'/60'/0'/0",
      },
      gasPrice: 20000000000,
      url: "https://bsc-dataseed.binance.org/",
    },
    polygon: {
      chainId: chainIds.polygon,
      accounts: {
        count: 10,
        initialIndex: 0,
        mnemonic,
        path: "m/44'/60'/0'/0",
      },
      url: "https://rpc-mainnet.maticvigil.com",
    },
    mumbai: {
      chainId: chainIds.mumbai,
      accounts: {
        count: 10,
        initialIndex: 0,
        mnemonic,
        path: "m/44'/60'/0'/0",
      },
      gasMultiplier: 2,
      url: "https://rpc-mumbai.maticvigil.com/",
    },
    xdai: {
      chainId: chainIds.xdai,
      accounts: {
        count: 10,
        initialIndex: 0,
        mnemonic,
        path: "m/44'/60'/0'/0",
      },
      url: "https://rpc.xdaichain.com",
    },
    mainnet: createConfig("mainnet"),
    goerli: createConfig("goerli"),
    kovan: createConfig("kovan"),
    rinkeby: createConfig("rinkeby"),
    ropsten: createConfig("ropsten"),
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.4",
    settings: {
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  mocha: {
    timeout: 200000,
  },
  watcher: {
    compile: {
      tasks: ["compile"],
      files: ["./contracts"],
      verbose: true,
    },
    test: {
      tasks: [{ command: "test", params: { testFiles: ["{path}"] } }],
      files: ["./test/**/*"],
      verbose: true,
    },
  },
  abiExporter: {
    path: "./data/abi",
    clear: true,
    flat: true,
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
  },
  etherscan: {
    apiKey: process.env.POLYGON_ETHERSCAN_API_KEY,
    // apiKey: process.env.BSC_ETHERSCAN_API_KEY
    // apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
