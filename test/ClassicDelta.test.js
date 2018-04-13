const ClassicDelta = artifacts.require('ClassicDelta');
const FixedSupplyToken = artifacts.require('FixedSupplyMock');
import assertRevert from './helpers/assertRevert';
contract('ClassicDelta', accounts => {
  let classicDelta;
  let fixedToken;
  let fixedTokenAddress;
  let fixedBalance = 1000;
  const creator = accounts[0];

  const feeAccount = accounts[2];
  const accountLevelsAddr = 0x0000000000000000000000000000000000000000;
  const feeMake = 10000000000000;
  const feeTake = 3000000000000000;
  const feeRebate = 100000000000;

  console.log('Estimated gas for contract is: ' + web3.eth.estimateGas({ data: ClassicDelta.bytecode }));

  beforeEach(async function () {
    classicDelta = await ClassicDelta.new(feeAccount, accountLevelsAddr, feeMake, feeTake, feeRebate,
      { from: creator });
    fixedToken = await FixedSupplyToken.new(creator, 1000000 * 10, "Example Fixed Supply Token", "FIXED", 18,
      { from: creator });
    fixedTokenAddress = await fixedToken.address;
    await fixedToken.transfer(accounts[1], fixedBalance, { from: creator });
  });

  it('Should revert when changing feeMake if newFeeMake > oldFeeMake', async function () {
    var newFeeMake = 40000000000000;
    var oldFeeMake = feeMake;
    console.log('feeMake' + feeMake);
    assert.isAbove(newFeeMake, oldFeeMake);
    assertRevert(classicDelta.changeFeeMake(newFeeMake));
    // console.log(assert);
  });

  it('Can change feeMake if newFeeMake < oldFeeMake', async function () {
    var newFeeMake = 1000000000000;
    var oldFeeMake = feeMake;
    assert.isAbove(oldFeeMake, newFeeMake);
    await classicDelta.changeFeeMake(newFeeMake);
    var currentFeeMake = await classicDelta.feeMake();
    assert.equal(currentFeeMake, newFeeMake);
  });

  it('Should revert when changing feeTake if newFeeTake > oldFeeTake', async function () {
    var newFeeTake = 4000000000000000;
    var oldFeeTake = feeTake;
    assert.isAbove(newFeeTake, oldFeeTake);
    assertRevert(classicDelta.changeFeeTake(newFeeTake));
  }); 

  it('Should revert when changing feeTake if newFeeTake < feeRebate', async function () {
    var newFeeTake = 10000000000;
    assert.isAbove(feeRebate, newFeeTake);
    assertRevert(classicDelta.changeFeeTake(newFeeTake));
  });

  it('Can change feeTake if feeRebate <= newFeeTake < oldFeeTake', async function () {
    var newFeeTake = 1000000000000;
    var oldFeeTake = feeTake;
    assert.isAbove(oldFeeTake, newFeeTake);
    assert.isAbove(newFeeTake, feeRebate);
    await classicDelta.changeFeeTake(newFeeTake);
    var currentFeeTake = await classicDelta.feeTake();
    assert.equal(currentFeeTake, newFeeTake);
  });

  it('Test fixed token-balances', async function () {
    let testAccount = accounts[1];
    let accBalance = await fixedToken.balanceOf(testAccount);
    assert.equal(accBalance, fixedBalance);
  });

  it('Test deposit ether', async function () {
    let testAccount = accounts[1];
    let amount = web3.toWei(5, 'ether');
    await classicDelta.deposit({from: testAccount, value: amount});
    let ethBalance = await classicDelta.balanceOf(0, testAccount);
    // let newOwner = await classicDelta.owner();
    assert.equal(ethBalance, amount);
  });

  it('Test withdraw ether', async function () {
    let testAccount = accounts[1];
    let amountForDep = web3.toWei(15, 'ether');
    let amountForWit = web3.toWei(5, 'ether');
    await classicDelta.deposit({from: testAccount, value: amountForDep});
    await classicDelta.withdraw(amountForWit, {from: testAccount});
    let ethBalance = await classicDelta.balanceOf(0, testAccount);
    assert.equal(ethBalance, amountForDep - amountForWit);
  });

  it('Test deposit token', async function () {
    let testAccount = accounts[1];
    let amountToDeposit = 100;
    let amountBeforeDeposit = await classicDelta.balanceOf(fixedTokenAddress, testAccount);
    // console.log('amountBeforeDeposit', amountBeforeDeposit.toNumber());

    await fixedToken.approve(classicDelta.address, amountToDeposit, {from: testAccount});
    await classicDelta.depositToken(fixedTokenAddress, amountToDeposit, {from: testAccount});

    let amountAfterDeposit = await classicDelta.balanceOf(fixedTokenAddress, testAccount);
    // console.log('amountAfterDeposit', amountAfterDeposit);
    assert.equal(amountBeforeDeposit.toNumber() + amountToDeposit, amountAfterDeposit.toNumber());
  });

  it('Test withdraw token', async function () {
    let testAccount = accounts[1];
    let amountToDeposit = 400;
    let amountToWithdraw = 300;

    await fixedToken.approve(classicDelta.address, amountToDeposit, {from: testAccount});
    await classicDelta.depositToken(fixedTokenAddress, amountToDeposit, {from: testAccount});

    let amountAfterDeposit = await classicDelta.balanceOf(fixedTokenAddress, testAccount);
    assert.equal(amountToDeposit, amountAfterDeposit.toNumber());

    await classicDelta.withdrawToken(fixedTokenAddress, amountToWithdraw, {from: testAccount});

    let amountAfterWithdraw = await classicDelta.balanceOf(fixedTokenAddress, testAccount);
    assert.equal(amountToDeposit - amountToWithdraw, amountAfterWithdraw.toNumber());
  });


  // it('Test create order', async function () {
  //   let user = accounts[4];
  //   let tokenGet = 0;
  //   let tokenGive = fixedTokenAddress;
  //   let amountGet = 1000;
  //   let amountGive = 20000;
  //   let expires = 0;
  //   let nonce = 0;
  //   // let v = "Hello World";
  //   // let r = "Hello World";
  //   // let s = "Hello World";
  //   // let firstAmount = 400;
  //   // let secondAmount = 400;

  //   await classicDelta.order(tokenGet, amountGet, tokenGive, amountGive, expires, nonce, {from: user});
  //   var tokens = classicDelta.tokens();
  //   console.log(tokens);
  //   var hash = web3.sha3(str(tokenGet) + )
  //   // await classicDelta.trade(tokenGet, amountGet, tokenGive, amountGive, expires, nonce,
  //   // user, v, r, s,  firstAmount, {from: user});
  //   // var 

  // });
});
