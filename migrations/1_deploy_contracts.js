const EvotingFactory = artifacts.require("./EvotingFactory.sol");
const EvotingLogic = artifacts.require("./EvotingLogic.sol");

module.exports = function(deployer) {
  deployer.deploy(EvotingFactory);
  deployer.deploy(EvotingLogic);
};
