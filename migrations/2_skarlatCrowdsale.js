const SkarlatCrowdsale = artifacts.require("./SkarlatCrowdsale.sol");

module.exports = async function (deployer, network, accounts) {
    const startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 1;
    const endTime = startTime + (86400 * 30);
    const rate = new web3.BigNumber(100);
    const wallet = accounts[0];

    deployer.deploy(SkarlatCrowdsale, startTime, endTime, rate, wallet);
};