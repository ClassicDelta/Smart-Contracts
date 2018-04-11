const ClassicDelta = artifacts.require('ClassicDelta');
const FixedSupplyToken = artifacts.require('FixedSupplyMock');

contract('ClassicDelta', accounts => {
  let classicDelta;
  let firstTokenContract;
  let firstContractAddress;
  let fixedBalance = 1000;
  const creator = accounts[0];

  const feeAccount = accounts[2];
  const accountLevelsAddr = 0x0000000000000000000000000000000000000000;
  const feeMake = 0;
  const feeTake = 3000000000000000;
  const feeRebate = 0;

  console.log('Estimated gas for contract is: ' + web3.eth.estimateGas({ data: ClassicDelta.bytecode }));

  beforeEach(async function () {
    classicDelta = await ClassicDelta.new(feeAccount, accountLevelsAddr, feeMake, feeTake, feeRebate,
      { from: creator });
    firstTokenContract = await FixedSupplyToken.new(creator, 1000000, "Example Fixed Supply Token", "FIXED", 18,
      { from: creator });
    firstContractAddress = await firstTokenContract.address;
    // send 1000 Fixed to each account

    await firstTokenContract.transfer(accounts[1], fixedBalance, { from: creator });
  });

  it('Test transfer ownership', async function () {
    let testAccount = accounts[1];
    await classicDelta.transferOwnership(testAccount);
    let newOwner = await classicDelta.owner();
    assert.equal(newOwner, testAccount);
  });

  it('Test fixed token-balances', async function () {
    let testAccount = accounts[1];
    let acc4Balance = await firstTokenContract.balanceOf(testAccount);
    assert.equal(acc4Balance, fixedBalance);
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
    let amountBeforeDeposit = await classicDelta.balanceOf(firstContractAddress, testAccount);
    // console.log('amountBeforeDeposit', amountBeforeDeposit.toNumber());

    await firstTokenContract.approve(classicDelta.address, amountToDeposit, {from: testAccount});
    await classicDelta.depositToken(firstContractAddress, amountToDeposit, {from: testAccount});

    let amountAfterDeposit = await classicDelta.balanceOf(firstContractAddress, testAccount);
    // console.log('amountAfterDeposit', amountAfterDeposit);
    assert.equal(amountBeforeDeposit.toNumber() + amountToDeposit, amountAfterDeposit.toNumber());
  });

  it('Test withdraw token', async function () {
    let testAccount = accounts[1];
    let amountToDeposit = 400;
    let amountToWithdraw = 300;

    await firstTokenContract.approve(classicDelta.address, amountToDeposit, {from: testAccount});
    await classicDelta.depositToken(firstContractAddress, amountToDeposit, {from: testAccount});

    let amountAfterDeposit = await classicDelta.balanceOf(firstContractAddress, testAccount);
    assert.equal(amountToDeposit, amountAfterDeposit.toNumber());

    await classicDelta.withdrawToken(firstContractAddress, amountToWithdraw, {from: testAccount});

    let amountAfterWithdraw = await classicDelta.balanceOf(firstContractAddress, testAccount);
    assert.equal(amountToDeposit - amountToWithdraw, amountAfterWithdraw.toNumber());
  });
});
