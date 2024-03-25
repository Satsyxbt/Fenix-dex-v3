// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.8.20;
pragma abicoder v1;

import './interfaces/vault/IAlgebraVaultFactory.sol';
import './base/BlastGovernorSetup.sol';

/// @title Algebra vault factory stub
/// @notice This contract is used to set AlgebraCommunityVault as communityVault in new pools
contract AlgebraVaultFactoryStub is IAlgebraVaultFactory, BlastGovernorSetup {
  /// @notice the address of AlgebraCommunityVault
  address public immutable defaultAlgebraCommunityVault;

  constructor(address _blastGovernor, address _algebraCommunityVault) {
    __BlastGovernorSetup_init(_blastGovernor);

    require(_algebraCommunityVault != address(0));
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
  function afterPoolInitialize(address) external override {}
}
