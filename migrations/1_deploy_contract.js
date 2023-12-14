const Hangman = artifacts.require("Hangman");

module.exports = function (deployer) {
  deployer.deploy(Hangman);
};