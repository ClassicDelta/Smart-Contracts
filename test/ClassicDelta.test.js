const ClassicDelta = artifacts.require('ClassicDelta');

contract('ClassicDelta', accounts => {
    let classicDelta;
    const creator = accounts[0];

    const admin = accounts[1];
    const feeAccount = accounts[2];
    const accountLevelsAddr = 0x0000000000000000000000000000000000000000;
    const feeMake = 0;
    const feeTake = 3000000000000000;
    const feeRebate = 0;

    beforeEach(async function () {
        classicDelta = await ClassicDelta.new(admin, feeAccount, accountLevelsAddr, feeMake, feeTake, feeRebate, { from: creator });
    });

    it('Test change admin', async function () {
        let oldAdmin = await classicDelta.admin();
        await classicDelta.changeAdmin(accounts[3], { from: oldAdmin});
        let newAdmin = await classicDelta.admin();
        assert.equal(newAdmin, accounts[3]);
    });

});
