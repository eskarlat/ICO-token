pragma solidity ^0.4.18;

import './../node_modules/zeppelin-solidity/contracts/crowdsale/Crowdsale.sol';
import './../node_modules/zeppelin-solidity/contracts/crowdsale/FinalizableCrowdsale.sol';
import './../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import './SkarlatToken.sol';

contract SkarlatCrowdsale is Crowdsale, FinalizableCrowdsale {

    function SkarlatCrowdsale(
        uint256 _startTime, 
        uint256 _endTime, 
        uint256 _rate,
        address _wallet
    ) public
        FinalizableCrowdsale()
        Crowdsale(_startTime, _endTime, _rate, _wallet)
    {}
    
    function createTokenContract() internal returns(MintableToken) {
        SkarlatToken _token = new SkarlatToken();
        _token.pause();
        return _token;
    }

    function finalization() internal {
        SkarlatToken _token = SkarlatToken(token);
        _token.unpause();
    }

    function getRate() internal constant returns(uint256) {
        if (now <= (startTime + 7 days)) {
            if (weiRaised >= 10 ether)
                return 300;
            else
                return 500;
        }

        if (now <= (startTime + 14 days)) {
            if (weiRaised >= 15 ether)
                return 150;
            else
                return 200;
        }

        return rate;
    }

    function adminMint(address _to, uint256 _value) public {
        require(!hasEnded());
        token.mint(_to, _value);
    }
}