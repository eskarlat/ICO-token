pragma solidity ^0.4.18;

import './../node_modules/zeppelin-solidity/contracts/token/MintableToken.sol';
import './../node_modules/zeppelin-solidity/contracts/token/PausableToken.sol';
import "./../node_modules/zeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract SkarlatToken is Pausable, MintableToken, PausableToken {

    string public constant name = "Skarlat Token";
    string public constant symbol = "SCT";
    uint8 public constant decimals = 18;

    function SkarlatToken() public {

    }
}