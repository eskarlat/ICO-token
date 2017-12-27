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
    const wallet = accounts[0];

    const owner = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[2];

    const firstSevenDays = startTime + (86400 * 7);
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

        it("check the number of LET tokens account1 has. It should have 0", async() => {
            let balance = await SkarlatTokenInst.balanceOf(account1);
            assert.equal(balance, 0, "The balance is not 0");
        });
    });
});