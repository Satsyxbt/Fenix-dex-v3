// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.20;

import '../interfaces/IBlastGovernor.sol';

contract BlastGovernorMock is IBlastGovernor {
  mapping(address => mapping(address => bool)) public called;

  function addGasHolder(address contractAddress_) external override {
    called[msg.sender][contractAddress_] = true;
  }
}
