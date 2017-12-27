const SkarlatToken = artifacts.require("./SkarlatToken.sol");
const SkarlatCrowdsale = artifacts.require("./SkarlatCrowdsale.sol");

const util = require('./util');
const expectThrow = util.expectThrow;

contract('SkarlatToken', (accounts) => {
    let SkarlatCrowdsaleInst;
    let tokenAddress;
    let SkarlatTokenInst;

    const startTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 1;
    const endTime = startTime + (86400 * 30);
    const rate = new web3.BigNumber(100);
    const wallet = accounts[4];

    const owner = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];

    const firstSevenDays = startTime + (86400 * 6);
    const secondSevenDays = startTime + (86400 * 14);
    const randomDay = startTime + (86400 * 20);
    const closeDay = startTime + (86400 * 40);

    describe("Basic test", () => {
        beforeEach(async() => {
            SkarlatCrowdsaleInst = await SkarlatCrowdsale.new(startTime, endTime, rate, wallet, {
                from: owner
            });

            tokenAddress = await SkarlatCrowdsaleInst.token();
            SkarlatTokenInst = await SkarlatToken.at(tokenAddress);
            await SkarlatCrowdsaleInst.setNow(startTime);
        });

        it("check the number of SCT tokens account1 has. It should have 0", async() => {
            let balance = await SkarlatTokenInst.balanceOf(account1);
            assert.equal(balance, 0, "The balance is not 0");
        });

        it("Buying SCT tokens,  should be 1ETH = 500 SCT", async() => {
            await SkarlatCrowdsaleInst.sendTransaction({
                from: account1,
                value: web3.toWei(1, "ether")
            });

            let balance = await SkarlatTokenInst.balanceOf(account1);
            balance = web3.fromWei(balance.toString(10), "ether")
            assert.equal(balance.toString(10), 500, "The balance is not 500");
        });

        it("Check wallet after buying", async() => {
            let walletBalanceAfter = web3.eth.getBalance(wallet);
            assert.equal(walletBalanceAfter.toString(10), 101000000000000000000, "The balance is not 101000000000000000000");
        });
    });

    describe("During the first 7 days", () => {
        beforeEach(async() => {
            SkarlatCrowdsaleInst = await SkarlatCrowdsale.new(startTime, endTime, rate, wallet, {
                from: owner
            });

            tokenAddress = await SkarlatCrowdsaleInst.token();
            SkarlatTokenInst = await SkarlatToken.at(tokenAddress);
            await SkarlatCrowdsaleInst.setNow(firstSevenDays);
        });

        it("If during these 7 days 10 ETH are raised the rate should go down to 1ETH = 300 SCT", async() => {
            await SkarlatCrowdsaleInst.sendTransaction({
                from: account2,
                value: web3.toWei(10, "ether")
            });

            await SkarlatCrowdsaleInst.sendTransaction({
                from: account1,
                value: web3.toWei(1, "ether")
            });

            let balance = await SkarlatTokenInst.balanceOf(account1);
            balance = web3.fromWei(balance.toString(10), "ether")
            assert.equal(balance.toString(10), 300, "The balance is not 300");
        });
    });

    describe("During the second 7 days (7 to 15)", () => {
        beforeEach(async() => {
            SkarlatCrowdsaleInst = await SkarlatCrowdsale.new(startTime, endTime, rate, wallet, {
                from: owner
            });

            tokenAddress = await SkarlatCrowdsaleInst.token();
            SkarlatTokenInst = await SkarlatToken.at(tokenAddress);
            await SkarlatCrowdsaleInst.setNow(secondSevenDays);
        });

        it("the rate should be 1ETH = 200 SCT", async() => {
            await SkarlatCrowdsaleInst.sendTransaction({
                from: account2,
                value: web3.toWei(29, "ether")
            });

            await SkarlatCrowdsaleInst.sendTransaction({
                from: account1,
                value: web3.toWei(1, "ether")
            });

            let balance = await SkarlatTokenInst.balanceOf(account1);
            balance = web3.fromWei(balance.toString(10), "ether")
            assert.equal(balance.toString(10), 200, "The balance is not 200");
        });

        it("if the total ETH raised from the begining of the campaign reaches 30ETH the rate should go down to 1ETH = 150 SCT", async() => {
            await SkarlatCrowdsaleInst.sendTransaction({
                from: account1,
                value: web3.toWei(30, "ether")
            });

            await SkarlatCrowdsaleInst.sendTransaction({
                from: account3,
                value: web3.toWei(1, "ether")
            });

            let balance = await SkarlatTokenInst.balanceOf(account3);
            balance = web3.fromWei(balance.toString(10), "ether")
            assert.equal(balance.toString(10), 150, "The balance is not 150");
        });
    });
});