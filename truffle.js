var HDWalletProvider = require("truffle-hdwallet-provider");
const config = require('./config.json');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropstenInfura: {
      provider: new HDWalletProvider(config.MNEMONIC, "https://ropsten.infura.io/" + config.INFURA_API_KEY),
      network_id: 3,
      gas: 4700036
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 500
    }
  }
};