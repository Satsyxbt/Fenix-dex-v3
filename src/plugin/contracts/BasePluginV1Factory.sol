// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.8.20;

import '@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol';
import '@cryptoalgebra/integral-core/contracts/interfaces/IAlgebraFactory.sol';
import '@cryptoalgebra/integral-core/contracts/BlastGovernorSetup.sol';

import './interfaces/IBasePluginV1Factory.sol';
import './libraries/AdaptiveFee.sol';
import './interfaces/IAlgebraBasePluginV1.sol';

/// @title Algebra Integral 1.0 default plugin factory
/// @notice This contract creates Algebra default plugins for Algebra liquidity pools
contract BasePluginV1Factory is IBasePluginV1Factory, BlastGovernorSetup {
  /// @inheritdoc IBasePluginV1Factory
  bytes32 public constant override ALGEBRA_BASE_PLUGIN_FACTORY_ADMINISTRATOR = keccak256('ALGEBRA_BASE_PLUGIN_FACTORY_ADMINISTRATOR');

  /// @inheritdoc IBasePluginV1Factory
  address public immutable override algebraFactory;

  /// @inheritdoc IBasePluginV1Factory
  AlgebraFeeConfiguration public override defaultFeeConfiguration; // values of constants for sigmoids in fee calculation formula

  /// @inheritdoc IBasePluginV1Factory
  address public override farmingAddress;

  /// @inheritdoc IBasePluginV1Factory
  address public override defaultBlastGovernor;

  /// @inheritdoc IBeacon
  address public override implementation;

  /// @inheritdoc IBasePluginV1Factory
  mapping(address poolAddress => address pluginAddress) public override pluginByPool;

  modifier onlyAdministrator() {
    require(IAlgebraFactory(algebraFactory).hasRoleOrOwner(ALGEBRA_BASE_PLUGIN_FACTORY_ADMINISTRATOR, msg.sender), 'Only administrator');
    _;
  }

  constructor(address _blastGovernor, address _algebraFactory, address _basePluginV1Implementation) {
    __BlastGovernorSetup_init(_blastGovernor);

    defaultBlastGovernor = _blastGovernor;

    algebraFactory = _algebraFactory;
    defaultFeeConfiguration = AdaptiveFee.initialFeeConfiguration();

    _setImplementation(_basePluginV1Implementation);

    emit DefaultFeeConfiguration(defaultFeeConfiguration);
  }

  /// @inheritdoc IAlgebraPluginFactory
  function createPlugin(address pool, address, address) external override returns (address) {
    require(msg.sender == algebraFactory);
    return _createPlugin(pool);
  }

  /// @inheritdoc IBasePluginV1Factory
  function createPluginForExistingPool(address token0, address token1) external override returns (address) {
    IAlgebraFactory factory = IAlgebraFactory(algebraFactory);
    require(factory.hasRoleOrOwner(factory.POOLS_ADMINISTRATOR_ROLE(), msg.sender));

    address pool = factory.poolByPair(token0, token1);
    require(pool != address(0), 'Pool not exist');

    return _createPlugin(pool);
  }

  function _createPlugin(address pool) internal returns (address) {
    require(pluginByPool[pool] == address(0), 'Already created');
    IAlgebraBasePluginV1 volatilityOracle = IAlgebraBasePluginV1(address(new BeaconProxy(address(this), '')));
    volatilityOracle.initialize(defaultBlastGovernor, pool, algebraFactory, address(this));
    volatilityOracle.changeFeeConfiguration(defaultFeeConfiguration);
    pluginByPool[pool] = address(volatilityOracle);
    return address(volatilityOracle);
  }

  /// @inheritdoc IBasePluginV1Factory
  function setDefaultBlastGovernor(address defaultBlastGovernor_) external override onlyAdministrator {
    defaultBlastGovernor = defaultBlastGovernor_;
    emit DefaultBlastGovernor(defaultBlastGovernor_);
  }

  /// @inheritdoc IBasePluginV1Factory
  function setDefaultFeeConfiguration(AlgebraFeeConfiguration calldata newConfig) external override onlyAdministrator {
    AdaptiveFee.validateFeeConfiguration(newConfig);
    defaultFeeConfiguration = newConfig;
    emit DefaultFeeConfiguration(newConfig);
  }

  /// @inheritdoc IBasePluginV1Factory
  function setFarmingAddress(address newFarmingAddress) external override onlyAdministrator {
    require(farmingAddress != newFarmingAddress);
    farmingAddress = newFarmingAddress;
    emit FarmingAddress(newFarmingAddress);
  }

  /**
   * @dev Upgrades the beacon to a new implementation.
   *
   * Emits an {Upgraded} event.
   *
   * Requirements:
   *
   * - msg.sender must be the plugin adminisrator.
   * - `newImplementation` must be a contract.
   */
  function upgradeTo(address newImplementation) external onlyAdministrator {
    _setImplementation(newImplementation);
  }

  /**
   * @dev Sets the implementation contract address for this beacon
   *
   * Requirements:
   *
   * - `newImplementation` must be a contract.
   */
  function _setImplementation(address newImplementation) private {
    if (newImplementation.code.length == 0) {
      revert BeaconInvalidImplementation(newImplementation);
    }
    implementation = newImplementation;
    emit Upgraded(newImplementation);
  }
}
