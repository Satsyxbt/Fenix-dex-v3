// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.20;

contract BlastMock {
  uint256 public bytecode;

  mapping(address => address) public governorMap;

  function configureGovernor(address governor_) external {
    governorMap[msg.sender] = governor_;
  }
}
