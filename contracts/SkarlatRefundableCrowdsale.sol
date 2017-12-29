pragma solidity ^0.4.18;

import './../node_modules/zeppelin-solidity/contracts/crowdsale/RefundableCrowdsale.sol';
import './../node_modules/zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol';
import './SkarlatCrowdsale.sol';

contract SkarlatRefundableCrowdsale is CappedCrowdsale, SkarlatCrowdsale, RefundableCrowdsale {
    function SkarlatRefundableCrowdsale(
        uint256 _startTime, 
        uint256 _endTime, 
        uint256 _rate,
        uint256 _goal,
        uint256 _cap,
        address _wallet
    ) public
        SkarlatCrowdsale(_startTime, _endTime, _rate, _wallet)
        RefundableCrowdsale(_goal)
        CappedCrowdsale(_cap)
    {
        require(_goal <= _cap);
    }
}