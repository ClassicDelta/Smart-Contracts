// const ClassicDelta = artifacts.require('ClassicDelta');
// const FixedSupplyToken = artifacts.require('FixedSupplyToken');

// contract('ClassicDelta', accounts => {
//   let classicDelta;
//   let firstTokenContract;
//   let firstContractAddress;
//   let fixedBalance = 1000;
//   const creator = accounts[0];

//   const feeAccount = accounts[2];
//   const accountLevelsAddr = 0x0000000000000000000000000000000000000000;
//   const feeMake = 0;
//   const feeTake = 3000000000000000;
//   const feeRebate = 0;

//   console.log('Estimated gas for contract is: ' + web3.eth.estimateGas({ data: ClassicDelta.bytecode }));

//   beforeEach(async function () {
//     classicDelta = await ClassicDelta.new(feeAccount, accountLevelsAddr, feeMake, feeTake, feeRebate,
//       { from: creator });
//     firstTokenContract = await FixedSupplyToken.new({ from: creator });
//     firstContractAddress = await firstTokenContract.address;
//     // send 1000 Fixed to each account

//     await firstTokenContract.transfer(accounts[1], fixedBalance, { from: creator });
//     await firstTokenContract.transfer(accounts[2], fixedBalance, { from: creator });
//     await firstTokenContract.transfer(accounts[3], fixedBalance, { from: creator });
//     await firstTokenContract.transfer(accounts[4], fixedBalance, { from: creator });
//     await firstTokenContract.transfer(accounts[5], fixedBalance, { from: creator });
//     await firstTokenContract.transfer(accounts[6], fixedBalance, { from: creator });
//     await firstTokenContract.transfer(accounts[7], fixedBalance, { from: creator });
//     await firstTokenContract.transfer(accounts[8], fixedBalance, { from: creator });
//     await firstTokenContract.transfer(accounts[9], fixedBalance, { from: creator });

//     await firstTokenContract.approve(classicDelta.address, fixedBalance, {from: accounts[0]});
//     await firstTokenContract.approve(classicDelta.address, fixedBalance, {from: accounts[1]});
//     await firstTokenContract.approve(classicDelta.address, fixedBalance, {from: accounts[2]});
//     await firstTokenContract.approve(classicDelta.address, fixedBalance, {from: accounts[3]});
//     await firstTokenContract.approve(classicDelta.address, fixedBalance, {from: accounts[4]});
//     await firstTokenContract.approve(classicDelta.address, fixedBalance, {from: accounts[5]});
//     await firstTokenContract.approve(classicDelta.address, fixedBalance, {from: accounts[6]});
//     await firstTokenContract.approve(classicDelta.address, fixedBalance, {from: accounts[7]});
//     await firstTokenContract.approve(classicDelta.address, fixedBalance, {from: accounts[8]});
//     await firstTokenContract.approve(classicDelta.address, fixedBalance, {from: accounts[9]});
//   });

//   it('Test transfer ownership', async function () {
//     await classicDelta.transferOwnership(accounts[3]);
//     let newOwner = await classicDelta.owner();
//     assert.equal(newOwner, accounts[3]);
//   });

//   it('Test fixed token-balances', async function () {
//     let acc4Balance = await firstTokenContract.balanceOf(accounts[4]);
//     assert.equal(acc4Balance, fixedBalance);
//   });

//   it('Test fixed token approval', async function () {
//     let approvalAmount = await firstTokenContract.allowance(accounts[5], classicDelta.address);
//     assert.equal(approvalAmount, fixedBalance);
//   });

//   it('Test deposit ether', async function () {
//     var amount = web3.toWei(5, 'ether');
//     var testAccount = accounts[3];
//     await classicDelta.deposit({from: testAccount, value: amount});
//     let ethBalance = await classicDelta.balanceOf(0, testAccount);
//     // let newOwner = await classicDelta.owner();
//     assert.equal(ethBalance, amount);
//   });

//   it('Test withdraw ether', async function () {
//     var amountForDep = web3.toWei(15, 'ether');
//     var amountForWit = web3.toWei(5, 'ether');
//     var testAccount = accounts[2];
//     await classicDelta.deposit({from: testAccount, value: amountForDep});
//     await classicDelta.withdraw(amountForWit, {from: testAccount});
//     let ethBalance = await classicDelta.balanceOf(0, testAccount);
//     assert.equal(ethBalance, amountForDep - amountForWit);
//   });

//   it('Test deposit token', async function () {
//     let testAccount = accounts[2];
//     let amountToDeposit = 100;
//     let amountBeforeDeposit = await classicDelta.balanceOf(firstContractAddress, testAccount);
//     // console.log('amountBeforeDeposit', amountBeforeDeposit.toNumber());
//     await classicDelta.depositToken(firstContractAddress, amountToDeposit, {from: testAccount});
//     let amountAfterDeposit = await classicDelta.balanceOf(firstContractAddress, testAccount);
//     // console.log('amountAfterDeposit', amountAfterDeposit);
//     assert.equal(amountBeforeDeposit.toNumber() + amountToDeposit, amountAfterDeposit.toNumber());

//   });

//   it('Test withdraw token', async function () {
//     let testAccount = accounts[3];
//     let amountToDeposit = 400;
//     let amountToWithdraw = 300;
//     await classicDelta.depositToken(firstContractAddress, amountToDeposit, {from: testAccount});
//     let amountAfterDeposit = await classicDelta.balanceOf(firstContractAddress, testAccount);
//     assert.equal(amountToDeposit, amountAfterDeposit.toNumber());
//     await classicDelta.withdrawToken(firstContractAddress, amountToWithdraw, {from: testAccount});
//     let amountAfterWithdraw = await classicDelta.balanceOf(firstContractAddress, testAccount);
//     assert.equal(amountToDeposit - amountToWithdraw, amountAfterWithdraw.toNumber());
//   });




//   it('Test withdraw token', async function () {
//     let testAccount = accounts[3];
//     let amountToDeposit = 400;
//     let amountToWithdraw = 300;
//     await classicDelta.depositToken(firstContractAddress, amountToDeposit, {from: testAccount});
//     let amountAfterDeposit = await classicDelta.balanceOf(firstContractAddress, testAccount);
//     assert.equal(amountToDeposit, amountAfterDeposit.toNumber());
//     await classicDelta.withdrawToken(firstContractAddress, amountToWithdraw, {from: testAccount});
//     let amountAfterWithdraw = await classicDelta.balanceOf(firstContractAddress, testAccount);
//     assert.equal(amountToDeposit - amountToWithdraw, amountAfterWithdraw.toNumber());
//   });
// });
