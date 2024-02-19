// SPDX-License-Identifier: MIT
pragma solidity =0.8.20;
import {BlastGovernorSetup} from '../base/BlastGovernorSetup.sol';

contract BlastGovernorSetupMock is BlastGovernorSetup {
  constructor(address gov_) {
    __BlastGovernorSetup_init(gov_);
  }
}
