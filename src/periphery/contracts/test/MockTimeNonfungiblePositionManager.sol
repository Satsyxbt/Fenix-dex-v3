// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.20;

import '../NonfungiblePositionManager.sol';

contract MockTimeNonfungiblePositionManager is NonfungiblePositionManager {
    uint256 time;

    constructor(
        address _modeSfs,
        uint256 _sfsAssignTokenId,
        address _factory,
        address _WNativeToken,
        address _tokenDescriptor,
        address _poolDeployer
    )
        NonfungiblePositionManager(
            _modeSfs,
            _sfsAssignTokenId,
            _factory,
            _WNativeToken,
            _tokenDescriptor,
            _poolDeployer
        )
    {}

    function _blockTimestamp() internal view override returns (uint256) {
        return time;
    }

    function setTime(uint256 _time) external {
        time = _time;
    }
}
