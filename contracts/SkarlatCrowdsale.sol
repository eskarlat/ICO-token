pragma solidity ^0.4.17;

import './../node_modules/zeppelin-solidity/contracts/crowdsale/Crowdsale.sol';
import './SkarlatToken.sol';

contract SkarlatCrowdsale is Crowdsale {

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
}