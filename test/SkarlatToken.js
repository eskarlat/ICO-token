const SkarlatToken = artifacts.require("./SkarlatToken.sol");
const SkarlatCrowdsale = artifacts.require("./SkarlatCrowdsale.sol");

const util = require('./util');
const constants = require('./constants.json');
const expectThrow = util.expectThrow;
const setTime = util.setTime;
const getFutureTime = util.getFutureTime;
const getEndTime = util.getEndTime;

contract('SkarlatToken', (accounts) => {
    let SkarlatCrowdsaleInst;
    let tokenAddress;
    let SkarlatTokenInst;

    const rate = new web3.BigNumber(100);
    const owner = accounts[0];
    const wallet = accounts[1];
    const account1 = accounts[3];

    const firstSevenDays = (constants.COUNT_SECONDS_DAY * 6);

    const name = "Skarlat Token";
    const symbol = "SCT";
    const decimals = 18;

    describe("Basic test", () => {
        beforeEach(async() => {
            await setTime(firstSevenDays);

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

        it("check name of token", async() => {
            assert.equal(await SkarlatTokenInst.name.call(), name, "name is not valid");
        });

        it("check symbol of token", async() => {
            assert.equal(await SkarlatTokenInst.symbol.call(), symbol, "symbol is not valid");
        });

        it("check decimals of token", async() => {
            assert.equal(await SkarlatTokenInst.decimals.call(), decimals, "decimals is not valid");
        });
    });
});