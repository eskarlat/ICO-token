const SkarlatToken = artifacts.require("./SkarlatToken.sol");
const SkarlatCrowdsale = artifacts.require("./SkarlatCrowdsale.sol");

const util = require('./util');
const constants = require('./constants.json');
const expectThrow = util.expectThrow;
const setTime = util.setTime;
const getFutureTime = util.getFutureTime;
const getEndTime = util.getEndTime;

contract('SkarlatCrowdsale', (accounts) => {
    let SkarlatCrowdsaleInst;
    let tokenAddress;
    let SkarlatTokenInst;

    const rate = new web3.BigNumber(100);

    const wallet = accounts[1];
    const owner = accounts[0];
    const noOwner = accounts[2];
    const account1 = accounts[3];
    const account2 = accounts[4];
    const account3 = accounts[5];

    const firstSevenDays = (constants.COUNT_SECONDS_DAY * 6);
    const secondSevenDays = (constants.COUNT_SECONDS_DAY * 14);
    const randomDay = (constants.COUNT_SECONDS_DAY * 20);
    const closeDay = (constants.COUNT_SECONDS_DAY * 40);

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

        it("Buying SCT tokens, should be 1ETH = 500 SCT", async() => {
            await SkarlatCrowdsaleInst.buyTokens(account1, {
                from: account1,
                value: ether1
            });

            let balance = await SkarlatTokenInst.balanceOf(account1);
            assert.equal(balance.toString(10), ether1 * constants.RATE.BONUS_PERIOD_1.MIN, "The balance is match");

            let walletBalanceAfter = web3.eth.getBalance(wallet);
            assert.equal(walletBalanceAfter.toString(10), 101 * ether1, "The wallet balance is not match");
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
                from: account2,
                value: ether14
            });

            await SkarlatCrowdsaleInst.buyTokens(account1, {
                from: account1,
                value: ether1
            });

            let balance = await SkarlatTokenInst.balanceOf(account1);
            assert.equal(balance.toString(10), ether1 * constants.RATE.BONUS_PERIOD_1.MAX, "The balance is not match");
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
                from: account2,
                value: ether14
            })

            await SkarlatCrowdsaleInst.buyTokens(account1, {
                from: account1,
                value: ether1
            })

            let balance = await SkarlatTokenInst.balanceOf(account1);
            assert.equal(balance.toString(10), ether1 * constants.RATE.BONUS_PERIOD_2.MIN, "The balance is not match");
        });

        it("if the total ETH raised from the begining of the campaign reaches 30ETH the rate should go down to 1ETH = 150 SCT", async function () {
            await setTime(secondSevenDays);

            await SkarlatCrowdsaleInst.buyTokens(account1, {
                from: account1,
                value: ether15
            })

            await SkarlatCrowdsaleInst.buyTokens(account3, {
                from: account3,
                value: ether1
            })

            let balance = await SkarlatTokenInst.balanceOf(account3);
            assert.equal(balance.toString(10), ether1 * constants.RATE.BONUS_PERIOD_2.MAX, "The balance is not match");
        });

        it("For the remainder of the Period the rate should be the default one.", async() => {
            await setTime(randomDay);

            await SkarlatCrowdsaleInst.buyTokens(account2, {
                from: account2,
                value: ether1
            });

            let balance = await SkarlatTokenInst.balanceOf(account2);
            assert.equal(balance.toString(10), ether1 * constants.RATE.DEFAULT, "The balance is not match");
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
                from: account1,
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

        it("should throw mint free tokens not owner", async function () {
            await setTime(randomDay);

            await expectThrow(SkarlatCrowdsaleInst.adminMint(account1, ether10, {
                from: noOwner
            }));
        });
    });
});