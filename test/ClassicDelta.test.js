const ClassicDelta = artifacts.require('ClassicDelta');

contract('ClassicDelta', accounts => {
  let classicDelta;
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
  });

  it('Test transfer ownership', async function () {
    await classicDelta.transferOwnership(accounts[3]);
    let newOwner = await classicDelta.owner();
    assert.equal(newOwner, accounts[3]);
  });
});
