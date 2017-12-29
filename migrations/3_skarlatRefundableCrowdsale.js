const SkarlatRefundableCrowdsale = artifacts.require("./SkarlatRefundableCrowdsale.sol");

module.exports = async function (deployer, network, accounts) {
    const startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 1;
    const endTime = startTime + (86400 * 30);
    const rate = new web3.BigNumber(100);
    const wallet = accounts[0];
    const goal = 15000000000000000000;
    const cap = 70000000000000000000;

    deployer.deploy(SkarlatRefundableCrowdsale, startTime, endTime, rate, goal, cap, wallet);
};