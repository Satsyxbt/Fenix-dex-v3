// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.20;

import '../interfaces/IBlastRebasingTokensGovernor.sol';

contract RebasingTokenGovernorMock is IBlastRebasingTokensGovernor {
  mapping(address => mapping(address => bool)) public called;

  function addTokenHolder(address token_, address contractAddress_) external override {
    called[token_][contractAddress_] = true;
  }
}
