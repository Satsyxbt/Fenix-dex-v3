// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.20;
pragma abicoder v2;

import '../SwapRouter.sol';

contract MockTimeSwapRouter is SwapRouter {
    uint256 time;

    constructor(
        address _modeSfs,
        uint256 _sfsAssignTokenId,
        address _factory,
        address _WNativeToken,
        address _poolDeployer
    ) SwapRouter(_modeSfs, _sfsAssignTokenId, _factory, _WNativeToken, _poolDeployer) {}

    function _blockTimestamp() internal view override returns (uint256) {
        return time;
    }

    function setTime(uint256 _time) external {
        time = _time;
    }
}
