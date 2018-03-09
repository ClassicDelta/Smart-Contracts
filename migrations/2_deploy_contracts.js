var ClassicDelta = artifacts.require("ClassicDelta");

// NOTE: Use this file to easily deploy the contracts you're writing.
//   (but make sure to reset this file before committing
//    with `git checkout HEAD -- migrations/2_deploy_contracts.js`)

module.exports = function (deployer) {
  const ownerAccount = "0x2cB00324a6B9Eb1756770beF05Dc83FE2D375090";
  const admin = ownerAccount;
  const feeAccount = ownerAccount;
  const accountLevelsAddr = ownerAccount;
  const feeMake = 0;
  const feeTake = 0;
  const feeRebate = 0;

  deployer.deploy(ClassicDelta, admin, feeAccount, accountLevelsAddr, feeMake, feeTake, feeRebate);
};
