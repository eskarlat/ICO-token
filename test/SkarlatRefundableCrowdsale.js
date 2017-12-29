const SkarlatToken = artifacts.require("./SkarlatToken.sol");
const SkarlatRefundableCrowdsale = artifacts.require("./SkarlatRefundableCrowdsale.sol");

const util = require('./util');
const constants = require('./constants.json');
const expectThrow = util.expectThrow;
const setTime = util.setTime;
const getFutureTime = util.getFutureTime;
const getEndTime = util.getEndTime;

contract('SkarlatRefundableCrowdsale', (accounts) => {
    let SkarlatRefundableCrowdsaleInst;
    let tokenAddress;
    let SkarlatTokenInst;

    const rate = new web3.BigNumber(100);
    const goal = 15000000000000000000;
    const cap = 20000000000000000000;

    const firstSevenDays = (constants.COUNT_SECONDS_DAY * 6);
    const closeDay = (constants.COUNT_SECONDS_DAY * 40);


    const wallet = accounts[1];
    const owner = accounts[0];
    const account1 = accounts[3];

    const ether1 = 1000000000000000000;
    const ether5 = 5 * ether1;
    const ether15 = 15 * ether1;
    const ether20 = 20 * ether1;

    describe("Basic test", () => {
        let startTime;
        let endTime;

        beforeEach(async() => {
            startTime = getFutureTime();
            endTime = getEndTime();

            SkarlatRefundableCrowdsaleInst = await SkarlatRefundableCrowdsale.new(startTime, endTime, rate, goal, cap, wallet, {
                from: owner
            });

            tokenAddress = await SkarlatRefundableCrowdsaleInst.token();
            SkarlatTokenInst = await SkarlatToken.at(tokenAddress);
        });

        it("if crowdsale is unsuccessful, investors can claim refunds", async() => {
            await setTime(firstSevenDays);
            await SkarlatRefundableCrowdsaleInst.buyTokens(account1, {
                from: account1,
                value: ether5
            });

            let balance = await SkarlatTokenInst.balanceOf(account1);
            assert.equal(balance.toString(10), ether5 * constants.RATE.BONUS_PERIOD_1.MIN, "The balance is not match");

            await setTime(closeDay);

            await SkarlatRefundableCrowdsaleInst.finalize();

            await SkarlatRefundableCrowdsaleInst.claimRefund({
                from: account1
            });

        });

        it("Should throw when have a goal, can not claim refunds", async() => {
            await setTime(firstSevenDays);
            await SkarlatRefundableCrowdsaleInst.buyTokens(account1, {
                from: account1,
                value: ether15
            });

            let balance = await SkarlatTokenInst.balanceOf(account1);
            assert.equal(balance.toString(10), ether15 * constants.RATE.BONUS_PERIOD_1.MIN, "The balance is not match");

            await setTime(closeDay);

            await SkarlatRefundableCrowdsaleInst.finalize();

            await expectThrow(SkarlatRefundableCrowdsaleInst.claimRefund({
                from: account1
            }));

        });

        it("Should buyToken when no have cap", async() => {
            await setTime(firstSevenDays);
            await SkarlatRefundableCrowdsaleInst.buyTokens(account1, {
                from: account1,
                value: ether15
            });

            let balance = await SkarlatTokenInst.balanceOf(account1);
            assert.equal(balance.toString(10), ether15 * constants.RATE.BONUS_PERIOD_1.MIN, "The balance is not match");

            await SkarlatRefundableCrowdsaleInst.buyTokens(account1, {
                from: account1,
                value: ether1
            });
        });

        it("Should throw buyToken when have a cap", async() => {
            await setTime(firstSevenDays);
            await SkarlatRefundableCrowdsaleInst.buyTokens(account1, {
                from: account1,
                value: ether20
            });

            let balance = await SkarlatTokenInst.balanceOf(account1);
            assert.equal(balance.toString(10), ether20 * constants.RATE.BONUS_PERIOD_1.MIN, "The balance is not match");

            await expectThrow(SkarlatRefundableCrowdsaleInst.buyTokens(account1, {
                from: account1,
                value: ether1
            }));
        });
    });
});