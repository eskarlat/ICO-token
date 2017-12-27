pragma solidity ^0.4.17;

import './../node_modules/zeppelin-solidity/contracts/crowdsale/Crowdsale.sol';
import './SkarlatToken.sol';

contract SkarlatCrowdsale is Crowdsale {

    uint256 private ETH10 = 10000000000000000000;
    uint256 private ETH30 = 30000000000000000000;

    uint256 FIRST_SEVEN_DAYS = startTime + (86400 * 7);
    uint256 SECOND_SEVEN_DAYS = FIRST_SEVEN_DAYS + (86400 * 7);

    uint256 private _now;

    function SkarlatCrowdsale(
        uint256 _startTime, 
        uint256 _endTime, 
        uint256 _rate,
        address _wallet
    ) public Crowdsale(_startTime, _endTime, _rate, _wallet)
    {}
    
    function createTokenContract() internal returns(MintableToken) {
        return new SkarlatToken();
    }

    function setNow(uint256 time) public {
        _now = time;
    }

    function setRate() public payable {
        if (_now <= FIRST_SEVEN_DAYS) {
            if (weiRaised >= ETH10)
                rate = 300;
            else
                rate = 500;
        }

        if (_now > FIRST_SEVEN_DAYS && _now <= SECOND_SEVEN_DAYS) {
            if (weiRaised >= ETH30)
                rate = 150;
            else
                rate = 200;
        }
    }

    function transfer(address _to, uint256 _value) public {
        require(hasEnded());
        token.transfer(_to, _value);
    }

    function adminMint(address _to, uint256 _value) public {
        require(!hasEnded());
        require(_to != address(0));
        token.mint(_to, _value);
    }

    function () external payable {
        setRate();
        buyTokens(msg.sender);
    }
}