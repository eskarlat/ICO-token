pragma solidity ^0.4.18;

import './../node_modules/zeppelin-solidity/contracts/token/MintableToken.sol';

contract SkarlatToken is MintableToken {

    string public constant name = "Skarlat Token";
    string public constant symbol = "SCT";
    uint8 public constant decimals = 18;
    
}