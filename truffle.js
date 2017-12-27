module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
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