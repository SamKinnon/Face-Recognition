const ElectionFactory = artifacts.require("ElectionFactory");

module.exports = function(deployer) {
  // Use accounts[0] from your development network as the initial owner
  deployer.deploy(ElectionFactory, "0x6769fBb8037133694f0eE418BFDEc678608e5AdD");
};