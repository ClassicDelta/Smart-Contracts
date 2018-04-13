const ClassicDelta = artifacts.require('ClassicDelta');
const FixedSupplyToken = artifacts.require('FixedSupplyMock');
import assertRevert from './helpers/assertRevert';

contract('ClassicDelta', accounts => {
  let classicDelta;
  const creator = accounts[0];

  const feeAccount = accounts[2];
  const accountLevelsAddr = 0x0000000000000000000000000000000000000000;
  const feeMake = 10000000000000;
  const feeTake = 3000000000000000;
  const feeRebate = 0;

  console.log('Estimated gas for contract is: ' + web3.eth.estimateGas({ data: ClassicDelta.bytecode }));

  beforeEach(async function () {
    classicDelta = await ClassicDelta.new(feeAccount, accountLevelsAddr, feeMake, feeTake, feeRebate,
      { from: creator });
  });

  it('Test transfer ownership', async function () {
    let testAccount = accounts[1];
    await classicDelta.transferOwnership(testAccount);
    let newOwner = await classicDelta.owner();
    assert.equal(newOwner, testAccount);
  });

  it('Should allow only owner to transfer ownership', async function () {
    let testAccount = accounts[1];
    assertRevert(classicDelta.transferOwnership(testAccount, {from: accounts[2]}));
  });

  it('owner should have permission to change the fee-acount', async function () {
    let feeAccount_ = accounts[3];
    await classicDelta.changeFeeAccount(feeAccount_);
    let newFeeAccount = await classicDelta.feeAccount();
    assert.equal(newFeeAccount, feeAccount_);
  });

  it('Should allow only owner to change the fee-acount', async function () {
    let feeAccount_ = accounts[6];
    let fakeOwner = accounts[2];
    assertRevert(classicDelta.transferOwnership(feeAccount_, {from: fakeOwner}));
  });

  it('owner should have permission to change the fee-make', async function () {
    let feeMake_ = 300;
    await classicDelta.changeFeeMake(feeMake_);
    let newFeeMake = await classicDelta.feeMake();
    assert.equal(newFeeMake, feeMake_);
  });

  it('Should allow only owner to change the fee-make', async function () {
    let feeMake_ = 600;
    let fakeOwner = accounts[5];
    assertRevert(classicDelta.changeFeeMake(feeMake_, {from: fakeOwner}));
  });

  it('owner should have permission to change the fee-take', async function () {
    let feeTake_ = 5000; 
    await classicDelta.changeFeeTake(feeTake_);
    let newFeeTake = await classicDelta.feeTake();
    assert.equal(newFeeTake, feeTake_);
  });

  it('Should allow only owner to change the fee-take', async function () {
    let feeTake_ = 400;
    let fakeOwner = accounts[6];
    assertRevert(classicDelta.changeFeeTake(feeTake_, {from: fakeOwner}));
  });

  it('owner should have permission to change the fee-rebate', async function () {
    let feeRebate_ = 500;
    await classicDelta.changeFeeRebate(feeRebate_);
    let newFeeRebate = await classicDelta.feeRebate();
    assert.equal(newFeeRebate, feeRebate_);
  });

  it('Should allow only owner to change the fee-rebate', async function () {
    let feeRebate_ = 70;
    let fakeOwner = accounts[8];
    assertRevert(classicDelta.changeFeeRebate(feeRebate_, {from: fakeOwner}));
  });

  it('owner should have permission to change the account-level', async function () {
    let accountLevelsAddr_ = 2;
    await classicDelta.changeAccountLevelsAddr(accountLevelsAddr_);
    let newAccountLevelsAddr = await classicDelta.accountLevelsAddr();
    assert.equal(newAccountLevelsAddr, accountLevelsAddr_);
  });

  it('Should allow only owner to change the account-level', async function () {
    let accountLevelsAddr_ = 1;
    let fakeOwner = accounts[9];
    assertRevert(classicDelta.changeAccountLevelsAddr(accountLevelsAddr_, {from: fakeOwner}));
  });

});
