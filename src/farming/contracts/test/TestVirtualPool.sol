// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.8.20;

import '../farmings/EternalVirtualPool.sol';

/// @dev Test contract for Eternal virtual pool
contract TestVirtualPool is EternalVirtualPool {
  constructor(
    address _modeSfs,
    uint256 _sfsAssignTokenId,
    address _farmingAddress,
    address _plugin
  ) EternalVirtualPool(_modeSfs, _sfsAssignTokenId, _farmingAddress, _plugin) {
    //
  }

  function nextTick() external view returns (int24) {
    return globalNextInitializedTick;
  }

  function prevTick() external view returns (int24) {
    return globalPrevInitializedTick;
  }
}
