// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.8.20;
pragma abicoder v1;

import './interfaces/IAlgebraPoolDeployer.sol';

import './AlgebraPool.sol';
import './base/ModeSfsSetup.sol';

/// @title Algebra pool deployer
/// @notice Is used by AlgebraFactory to deploy pools
/// @dev Version: Algebra Integral 1.0
contract AlgebraPoolDeployer is IAlgebraPoolDeployer, ModeSfsSetup {
  address private tempModeSfs;
  uint256 private tempSfsAssignTokenId;
  address private tempPlugin;
  address private tempToken0;
  address private tempToken1;

  address private immutable factory;

  constructor(address _modeSfs, uint256 _sfsAssignTokenId, address _factory) {
    __ModeSfsSetup__init(_modeSfs, _sfsAssignTokenId);

    require(_factory != address(0));
    factory = _factory;
  }

  /// @inheritdoc IAlgebraPoolDeployer
  function getDeployParameters()
    external
    view
    override
    returns (address _modeSfs, uint256 _sfsAssignTokenId, address _plugin, address _factory, address _token0, address _token1)
  {
    (_modeSfs, _sfsAssignTokenId, _plugin, _token0, _token1) = (tempModeSfs, tempSfsAssignTokenId, tempPlugin, tempToken0, tempToken1);
    _factory = factory;
  }

  /// @inheritdoc IAlgebraPoolDeployer
  function deploy(
    address modeSfs,
    uint256 sfsAssignTokenId,
    address plugin,
    address token0,
    address token1
  ) external override returns (address pool) {
    require(msg.sender == factory);

    (tempModeSfs, tempSfsAssignTokenId, tempPlugin, tempToken0, tempToken1) = (modeSfs, sfsAssignTokenId, plugin, token0, token1);

    pool = address(new AlgebraPool{salt: keccak256(abi.encode(token0, token1))}());

    (tempModeSfs, tempSfsAssignTokenId, tempPlugin, tempToken0, tempToken1) = (address(0), 0, address(0), address(0), address(0));
  }
}
