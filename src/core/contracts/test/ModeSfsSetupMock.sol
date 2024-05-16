// SPDX-License-Identifier: MIT
pragma solidity =0.8.20;
import {ModeSfsSetup} from '../base/ModeSfsSetup.sol';

contract ModeSfsSetupMock is ModeSfsSetup {
  constructor(address modeSfs_, uint256 sfsAssignTokenId_) {
    __ModeSfsSetup__init(modeSfs_, sfsAssignTokenId_);
  }
}
