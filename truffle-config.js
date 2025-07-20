module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",   // Ganache
      port: 7545,
      network_id: "*"      // Match any network
    }
  },
  compilers: {
    solc: {
      version: "0.8.0"
    }
  }
};
