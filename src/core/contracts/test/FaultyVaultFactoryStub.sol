// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.8.20;
pragma abicoder v1;

import '../interfaces/vault/IAlgebraVaultFactory.sol';

/// @title Algebra vault factory stub
/// @notice This contract is used to set AlgebraCommunityVault as communityVault in new pools
contract FaultyVaultFactoryStub is IAlgebraVaultFactory {
  event AfterPoolInitialize__Test(address indexed caller, address indexed pool);

  /// @notice the address of AlgebraCommunityVault
  address public immutable defaultAlgebraCommunityVault;

  constructor(address _algebraCommunityVault) {
    defaultAlgebraCommunityVault = _algebraCommunityVault;
  }

  /// @inheritdoc IAlgebraVaultFactory
  function getVaultForPool(address) external view override returns (address) {
    return defaultAlgebraCommunityVault;
  }

  /// @inheritdoc IAlgebraVaultFactory
  function createVaultForPool(address) external view override returns (address) {
    return defaultAlgebraCommunityVault;
  }

  /// @inheritdoc IAlgebraVaultFactory
  function afterPoolInitialize(address pool) external override {
    emit AfterPoolInitialize__Test(msg.sender, pool);
  }
}
