pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/mocks/StandardTokenMock.sol";
import "zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";


contract FixedSupplyMock is StandardTokenMock, DetailedERC20 {
  function FixedSupplyMock(address _initialAccount, uint256 _initialBalance, string _name, string _symbol, uint8 _decimals)
  StandardTokenMock(_initialAccount, _initialBalance*_decimals)
  DetailedERC20(_name, _symbol, _decimals)
  public {}
}
