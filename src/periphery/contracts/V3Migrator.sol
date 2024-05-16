// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.8.20;

import '@cryptoalgebra/integral-core/contracts/libraries/LowGasSafeMath.sol';
import '@cryptoalgebra/integral-core/contracts/base/ModeSfsSetup.sol';

import './interfaces/external/IUniswapV2Pair.sol';
import './interfaces/external/IWNativeToken.sol';
import './interfaces/INonfungiblePositionManager.sol';
import './interfaces/IV3Migrator.sol';

import './base/PeripheryImmutableState.sol';
import './base/Multicall.sol';
import './base/SelfPermit.sol';
import './base/PoolInitializer.sol';

import './libraries/TransferHelper.sol';

/// @title Algebra Migrator
/// @dev Credit to Uniswap Labs under GPL-2.0-or-later license:
/// https://github.com/Uniswap/v3-periphery
contract V3Migrator is IV3Migrator, PeripheryImmutableState, PoolInitializer, Multicall, SelfPermit, ModeSfsSetup {
    using LowGasSafeMath for uint256;

    address public immutable nonfungiblePositionManager;

    constructor(
        address _modeSfs,
        uint256 _sfsAssignTokenId,
        address _factory,
        address _WNativeToken,
        address _nonfungiblePositionManager,
        address _poolDeployer
    ) PeripheryImmutableState(_factory, _WNativeToken, _poolDeployer) {
        __ModeSfsSetup__init(_modeSfs, _sfsAssignTokenId);
        nonfungiblePositionManager = _nonfungiblePositionManager;
    }

    receive() external payable {
        require(msg.sender == WNativeToken, 'Not WNativeToken');
    }

    function migrate(MigrateParams calldata params) external override {
        require(params.percentageToMigrate > 0, 'Percentage too small');
        require(params.percentageToMigrate <= 100, 'Percentage too large');

        // burn v2 liquidity to this address
        IUniswapV2Pair(params.pair).transferFrom(msg.sender, params.pair, params.liquidityToMigrate);
        (uint256 amount0V2, uint256 amount1V2) = IUniswapV2Pair(params.pair).burn(address(this));

        // calculate the amounts to migrate to v3
        uint256 amount0V2ToMigrate = (amount0V2 * params.percentageToMigrate) / 100;
        uint256 amount1V2ToMigrate = (amount1V2 * params.percentageToMigrate) / 100;

        // approve the position manager up to the maximum token amounts
        TransferHelper.safeApprove(params.token0, nonfungiblePositionManager, amount0V2ToMigrate);
        TransferHelper.safeApprove(params.token1, nonfungiblePositionManager, amount1V2ToMigrate);

        // mint v3 position
        (, , uint256 amount0V3, uint256 amount1V3) = INonfungiblePositionManager(nonfungiblePositionManager).mint(
            INonfungiblePositionManager.MintParams({
                token0: params.token0,
                token1: params.token1,
                tickLower: params.tickLower,
                tickUpper: params.tickUpper,
                amount0Desired: amount0V2ToMigrate,
                amount1Desired: amount1V2ToMigrate,
                amount0Min: params.amount0Min,
                amount1Min: params.amount1Min,
                recipient: params.recipient,
                deadline: params.deadline
            })
        );

        // if necessary, clear allowance and refund dust
        if (amount0V3 < amount0V2) {
            if (amount0V3 < amount0V2ToMigrate) {
                TransferHelper.safeApprove(params.token0, nonfungiblePositionManager, 0);
            }

            uint256 refund0 = amount0V2 - amount0V3;
            if (params.refundAsNative && params.token0 == WNativeToken) {
                IWNativeToken(WNativeToken).withdraw(refund0);
                TransferHelper.safeTransferNative(msg.sender, refund0);
            } else {
                TransferHelper.safeTransfer(params.token0, msg.sender, refund0);
            }
        }

        if (amount1V3 < amount1V2) {
            if (amount1V3 < amount1V2ToMigrate) {
                TransferHelper.safeApprove(params.token1, nonfungiblePositionManager, 0);
            }

            uint256 refund1 = amount1V2 - amount1V3;
            if (params.refundAsNative && params.token1 == WNativeToken) {
                IWNativeToken(WNativeToken).withdraw(refund1);
                TransferHelper.safeTransferNative(msg.sender, refund1);
            } else {
                TransferHelper.safeTransfer(params.token1, msg.sender, refund1);
            }
        }
    }
}
