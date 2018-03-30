var ClassicDelta = artifacts.require('ClassicDelta');

// NOTE: Use this file to easily deploy the contracts you're writing.
//   (but make sure to reset this file before committing
//    with `git checkout HEAD -- migrations/2_deploy_contracts.js`)

module.exports = function (deployer) {
  const feeAccount = '0x2cB00324a6B9Eb1756770beF05Dc83FE2D375090';
  const accountLevelsAddr = 0x0000000000000000000000000000000000000000;
  const feeMake = 0;
  const feeTake = 3000000000000000;
  const feeRebate = 0;

  deployer.deploy(ClassicDelta, feeAccount, accountLevelsAddr, feeMake, feeTake, feeRebate);
};
