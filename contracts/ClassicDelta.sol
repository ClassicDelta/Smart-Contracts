pragma solidity ^0.4.21;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./AccountLevels.sol";




contract ClassicDelta is Ownable {
  using SafeMath for uint256;

  address public feeAccount; //the account that will receive fees
  address public accountLevelsAddr; //the address of the AccountLevels contract
  uint public feeMake; //percentage times (1 ether)
  uint public feeTake; //percentage times (1 ether)
  uint public feeRebate; //percentage times (1 ether)
  mapping (address => mapping (address => uint)) public tokens; //mapping of token addresses to mapping of account balances (token=0 means Ether)
  mapping (address => mapping (bytes32 => bool)) public orders; //mapping of user accounts to mapping of order hashes to booleans (true = submitted by user, equivalent to offchain signature)
  mapping (address => mapping (bytes32 => uint)) public orderFills; //mapping of user accounts to mapping of order hashes to uints (amount of order that has been filled)

  event Order(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user);
  event Cancel(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user, uint8 v, bytes32 r, bytes32 s);
  event Trade(address tokenGet, uint amountGet, address tokenGive, uint amountGive, address get, address give);
  event Deposit(address token, address user, uint amount, uint balance);
  event Withdraw(address token, address user, uint amount, uint balance);

  function ClassicDelta(
    address feeAccount_,
    address accountLevelsAddr_,
    uint feeMake_,
    uint feeTake_,
    uint feeRebate_) public
  {
    feeAccount = feeAccount_;
    accountLevelsAddr = accountLevelsAddr_;
    feeMake = feeMake_;
    feeTake = feeTake_;
    feeRebate = feeRebate_;
  }

  function() public {
    revert();
  }

  function changeAccountLevelsAddr(address accountLevelsAddr_) public onlyOwner {
    accountLevelsAddr = accountLevelsAddr_;
  }

  function changeFeeAccount(address feeAccount_) public onlyOwner {
    feeAccount = feeAccount_;
  }

  function changeFeeMake(uint feeMake_) public onlyOwner {
    require (feeMake_ <= feeMake);
    feeMake = feeMake_;
  }

  function changeFeeTake(uint feeTake_) public onlyOwner {
    require (feeTake_ <= feeTake && feeTake_ >= feeRebate);
    feeTake = feeTake_;
  }

  function changeFeeRebate(uint feeRebate_) public onlyOwner {
    require (feeRebate_ >= feeRebate && feeRebate_ <= feeTake);
    feeRebate = feeRebate_;
  }

  function commonDeposit(address token, uint value) internal {
    tokens[token][msg.sender] = tokens[token][msg.sender] + value;
    emit Deposit(
    token,
    msg.sender,
    value,
    tokens[token][msg.sender]);
  }

  function deposit() public payable {
    commonDeposit(0, msg.value);
  }

  function commonWithdraw(address token, uint amount) internal {
    require (tokens[token][msg.sender] >= amount);
    tokens[token][msg.sender] = tokens[token][msg.sender] - amount;
    require((token != 0)?
      ERC20(token).transfer(msg.sender, amount):
      // solium-disable-next-line security/no-call-value
      msg.sender.call.value(amount)()
    );
    emit Withdraw(
    token,
    msg.sender,
    amount,
    tokens[token][msg.sender]);
  }

  function withdraw(uint amount) public {
    commonWithdraw(0, amount);
  }

  function depositToken(address token, uint amount) public {
    //remember to call Token(address).approve(this, amount) or this contract will not be able to do the transfer on your behalf.
    require(token!=0);
    require (ERC20(token).transferFrom(msg.sender, this, amount));
    commonDeposit(token, amount);
  }

  function withdrawToken(address token, uint amount) public {
    require(token!=0);
    commonWithdraw(token, amount);
  }

  function balanceOf(address token, address user) public constant returns (uint) {
    return tokens[token][user];
  }

  function order(
    address tokenGet,
    uint amountGet,
    address tokenGive,
    uint amountGive,
    uint expires,
    uint nonce) public
  {
    bytes32 hash = sha256(
      this,
      tokenGet,
      amountGet,
      tokenGive,
      amountGive,
      expires,
      nonce);
    orders[msg.sender][hash] = true;
    emit Order(
      tokenGet,
      amountGet,
      tokenGive,
      amountGive,
      expires,
      nonce,
      msg.sender);
  }

  function trade(
    address tokenGet,
    uint amountGet,
    address tokenGive,
    uint amountGive,
    uint expires,
    uint nonce,
    address user,
    uint8 v,
    bytes32 r,
    bytes32 s,
    uint amount) public
  {
    //amount is in amountGet terms
    bytes32 hash = sha256(
      this,
      tokenGet,
      amountGet,
      tokenGive,
      amountGive,
      expires,
      nonce);
    /* solium-disable-next-line */
    require((orders[user][hash] || ecrecover(keccak256("\x19Ethereum Signed Message:\n32", hash), v, r, s) == user) && block.number <= expires && orderFills[user][hash] + amount <= amountGet);
    tradeBalances(
      tokenGet,
      amountGet,
      tokenGive,
      amountGive,
      user,
      amount);
    orderFills[user][hash] = orderFills[user][hash] + amount;
    emit Trade(
      tokenGet,
      amount,
      tokenGive,
      amountGive * amount / amountGet,
      user,
      msg.sender);
  }

  function testTrade(
    address tokenGet,
    uint amountGet,
    address tokenGive,
    uint amountGive,
    uint expires,
    uint nonce,
    address user,
    uint8 v,
    bytes32 r,
    bytes32 s,
    uint amount,
    address sender) public constant returns(bool)
  {
    if (
      tokens[tokenGet][sender] < amount ||
      availableVolume(
        tokenGet,
        amountGet,
        tokenGive,
        amountGive,
        expires,
        nonce,
        user,
        v,
        r,
        s) < amount
    ) return false;
    return true;
  }

  function availableVolume(
    address tokenGet,
    uint amountGet,
    address tokenGive,
    uint amountGive,
    uint expires,
    uint nonce,
    address user,
    uint8 v,
    bytes32 r,
    bytes32 s) public constant returns(uint)
  {
    bytes32 hash = sha256(
      this,
      tokenGet,
      amountGet,
      tokenGive,
      amountGive,
      expires,
      nonce);
    if (
        (
          !orders[user][hash] &&
          ecrecover(
            keccak256("\x19Ethereum Signed Message:\n32", hash),
            v,
            r,
            s
          ) != user
        ) || block.number > expires
      ) return 0;
    uint available1 = amountGet - orderFills[user][hash];
    uint available2 = tokens[tokenGive][user] * amountGet / amountGive;
    if (available1<available2)
      return available1;
    return available2;
  }

  function amountFilled(
    address tokenGet,
    uint amountGet,
    address tokenGive,
    uint amountGive,
    uint expires,
    uint nonce,
    address user,
    uint8 /*v*/,
    bytes32 /*r*/,
    bytes32 /*s*/) public constant returns(uint)
  {
    bytes32 hash = sha256(
      this,
      tokenGet,
      amountGet,
      tokenGive,
      amountGive,
      expires,
      nonce);
    return orderFills[user][hash];
  }

  function cancelOrder(
    address tokenGet,
    uint amountGet,
    address tokenGive,
    uint amountGive,
    uint expires,
    uint nonce,
    uint8 v,
    bytes32 r,
    bytes32 s) public
  {
    bytes32 hash = sha256(
      this,
      tokenGet,
      amountGet,
      tokenGive,
      amountGive,
      expires,
      nonce);
    require(
      orders[msg.sender][hash] || ecrecover(
        keccak256("\x19Ethereum Signed Message:\n32", hash),
        v,
        r,
        s
      ) == msg.sender
    );
    orderFills[msg.sender][hash] = amountGet;
    emit Cancel(
      tokenGet,
      amountGet,
      tokenGive,
      amountGive,
      expires,
      nonce,
      msg.sender,
      v,
      r,
      s);
  }

  function tradeBalances(
    address tokenGet,
    uint amountGet,
    address tokenGive,
    uint amountGive,
    address user,
    uint amount) private
  {
    uint feeMakeXfer = amount * feeMake / (1 ether);
    uint feeTakeXfer = amount * feeTake / (1 ether);
    uint feeRebateXfer = 0;
    if (accountLevelsAddr != 0x0) {
      uint accountLevel = AccountLevels(accountLevelsAddr).accountLevel(user);
      if (accountLevel==1)
        feeRebateXfer = amount * feeRebate / (1 ether);
      if (accountLevel==2)
        feeRebateXfer = feeTakeXfer;
    }
    tokens[tokenGet][msg.sender] = tokens[tokenGet][msg.sender] - (amount + feeTakeXfer);
    tokens[tokenGet][user] = tokens[tokenGet][user] + (amount + feeRebateXfer - feeMakeXfer);
    tokens[tokenGet][feeAccount] = (tokens[tokenGet][feeAccount] + feeMakeXfer + feeTakeXfer - feeRebateXfer);
    tokens[tokenGive][user] = (tokens[tokenGive][user] - amountGive * amount / amountGet);
    tokens[tokenGive][msg.sender] = tokens[tokenGive][msg.sender] + amountGive * amount / amountGet;
  }
}