const SkarlatToken = artifacts.require("./SkarlatToken.sol");
const SkarlatCrowdsale = artifacts.require("./SkarlatCrowdsale.sol");

const util = require('./util');
const expectThrow = util.expectThrow;
const setTime = util.setTime;

contract('SkarlatToken', (accounts) => {
    let SkarlatCrowdsaleInst;
    let tokenAddress;
    let SkarlatTokenInst;

    let getFutureTime = function () {
        return web3.eth.getBlock(web3.eth.blockNumber).timestamp + 1;
    }

    let getEndTime = function () {
        return getFutureTime() + (86400 * 30);
    }

    const rate = new web3.BigNumber(100);
    const wallet = accounts[4];

    const owner = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];

    const firstSevenDays = (86400 * 6);
    const secondSevenDays = (86400 * 14);
    const randomDay = (86400 * 20);
    const closeDay = (86400 * 40);

    const ether1 = 1000000000000000000;
    const ether14 = 14 * ether1;
    const ether15 = 15 * ether1;
    const ether10 = 10 * ether1;

    describe("Basic test", () => {
        let startTime;
        let endTime;

        beforeEach(async() => {
            startTime = getFutureTime();
            endTime = getEndTime();

            SkarlatCrowdsaleInst = await SkarlatCrowdsale.new(startTime, endTime, rate, wallet, {
                from: owner
            });

            tokenAddress = await SkarlatCrowdsaleInst.token();
            SkarlatTokenInst = await SkarlatToken.at(tokenAddress);
        });

        it("check the number of SCT tokens account1 has. It should have 0", async() => {
            let balance = await SkarlatTokenInst.balanceOf(account1);
            assert.equal(balance, 0, "The balance is not 0");
        });

        it("Buying SCT tokens,  should be 1ETH = 500 SCT", async() => {
            await SkarlatCrowdsaleInst.buyTokens(account1, {
                from: owner,
                value: ether1
            });

            let balance = await SkarlatTokenInst.balanceOf(account1);
            assert.equal(balance.toString(10), ether1 * 500, "The balance is not 500");
        });

        it("Check wallet after buying", async() => {
            let walletBalanceAfter = web3.eth.getBalance(wallet);
            assert.equal(walletBalanceAfter.toString(10), 101 * ether1, "The balance is not match");
        });
    });

    describe("During the first 7 days", () => {

        beforeEach(async() => {
            let startTime = getFutureTime();
            let endTime = getEndTime();

            SkarlatCrowdsaleInst = await SkarlatCrowdsale.new(startTime, endTime, rate, wallet, {
                from: owner
            });

            tokenAddress = await SkarlatCrowdsaleInst.token();
            SkarlatTokenInst = await SkarlatToken.at(tokenAddress);
        });

        it("If during these 7 days 10 ETH are raised the rate should go down to 1ETH = 300 SCT", async() => {
            await setTime(firstSevenDays);

            await SkarlatCrowdsaleInst.buyTokens(account2, {
                from: wallet,
                value: ether14
            });

            await SkarlatCrowdsaleInst.buyTokens(account1, {
                from: wallet,
                value: ether1
            });

            let balance = await SkarlatTokenInst.balanceOf(account1);
            assert.equal(balance.toString(10), ether1 * 300, "The balance is not match");
        });
    });

    describe("During the second 7 days (7 to 15)", () => {

        beforeEach(async function () {
            let startTime = getFutureTime();
            let endTime = getEndTime();

            SkarlatCrowdsaleInst = await SkarlatCrowdsale.new(startTime, endTime, rate, wallet, {
                from: owner
            });

            tokenAddress = await SkarlatCrowdsaleInst.token();
            SkarlatTokenInst = await SkarlatToken.at(tokenAddress);
        });

        it("the rate should be 1ETH = 200 SCT", async function () {
            await setTime(secondSevenDays);

            await SkarlatCrowdsaleInst.buyTokens(account2, {
                from: wallet,
                value: ether14
            })

            await SkarlatCrowdsaleInst.buyTokens(account1, {
                from: wallet,
                value: ether1
            })

            let balance = await SkarlatTokenInst.balanceOf(account1);
            assert.equal(balance.toString(10), ether1 * 200, "The balance is not match");
        });

        it("if the total ETH raised from the begining of the campaign reaches 30ETH the rate should go down to 1ETH = 150 SCT", async function () {
            await setTime(secondSevenDays);

            await SkarlatCrowdsaleInst.buyTokens(account1, {
                from: wallet,
                value: ether15
            })

            await SkarlatCrowdsaleInst.buyTokens(account3, {
                from: wallet,
                value: ether1
            })

            let balance = await SkarlatTokenInst.balanceOf(account3);
            assert.equal(balance.toString(10), ether1 * 150, "The balance is not match");
        });

        it("For the remainder of the Period the rate should be the default one.", async() => {
            await setTime(randomDay);

            await SkarlatCrowdsaleInst.buyTokens(account2, {
                from: wallet,
                value: ether1
            });

            let balance = await SkarlatTokenInst.balanceOf(account2);
            assert.equal(balance.toString(10), ether1 * 100, "The balance is not match");
        });
    });

    describe("The transfering (trading) of tokens", () => {

        beforeEach(async function () {
            let startTime = getFutureTime();
            let endTime = getEndTime();

            SkarlatCrowdsaleInst = await SkarlatCrowdsale.new(startTime, endTime, rate, wallet, {
                from: owner
            });

            tokenAddress = await SkarlatCrowdsaleInst.token();
            SkarlatTokenInst = await SkarlatToken.at(tokenAddress);

            await setTime(randomDay);

            await SkarlatCrowdsaleInst.buyTokens(account1, {
                from: wallet,
                value: ether10
            });
        });

        it("should be disabled until the Crowdsale is over", async function () {
            await expectThrow(SkarlatTokenInst.transfer(
                account2, ether1, {
                    from: account1
                }
            ));
        });

        it("should be active after the Crowdsale is over", async function () {
            await setTime(closeDay);
            await SkarlatCrowdsaleInst.finalize();

            await SkarlatTokenInst.transfer(account2, ether1, {
                from: account1
            });

            let balance = await SkarlatTokenInst.balanceOf(account1);
            assert.equal(balance, ether1 * 999, "The balance is not match");

            balance = await SkarlatTokenInst.balanceOf(account2);
            assert.equal(balance, ether1 * 1, "The balance is not match");
        });
    });

    describe("Crowdsale Admin", () => {
        beforeEach(async function () {
            let startTime = getFutureTime();
            let endTime = getEndTime();

            SkarlatCrowdsaleInst = await SkarlatCrowdsale.new(startTime, endTime, rate, wallet, {
                from: owner
            });

            tokenAddress = await SkarlatCrowdsaleInst.token();
            SkarlatTokenInst = await SkarlatToken.at(tokenAddress);
        });

        it("mint free tokens during the crowdsale", async function () {
            await setTime(randomDay);

            await SkarlatCrowdsaleInst.adminMint(account1, ether10, {
                from: owner
            });

            balance = await SkarlatTokenInst.balanceOf(account1);
            assert.equal(balance, ether10, "The balance is not match");
        });

        it("should throw during the close crowdsale and mint free tokens", async function () {
            await setTime(closeDay);
            await SkarlatCrowdsaleInst.finalize();

            await expectThrow(SkarlatCrowdsaleInst.adminMint(account1, ether10, {
                from: owner
            }));
        });
    });
});