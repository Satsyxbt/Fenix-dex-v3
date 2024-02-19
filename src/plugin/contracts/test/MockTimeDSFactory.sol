// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.8.20;

import '@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol';
import '../base/AlgebraFeeConfiguration.sol';
import '../libraries/AdaptiveFee.sol';

import './MockTimeAlgebraBasePluginV1.sol';

import '../interfaces/IBasePluginV1Factory.sol';

import '@cryptoalgebra/integral-core/contracts/interfaces/plugin/IAlgebraPluginFactory.sol';

contract MockTimeDSFactory is IBasePluginV1Factory {
  /// @inheritdoc IBasePluginV1Factory
  bytes32 public constant override ALGEBRA_BASE_PLUGIN_FACTORY_ADMINISTRATOR = keccak256('ALGEBRA_BASE_PLUGIN_FACTORY_ADMINISTRATOR');

  address public immutable override algebraFactory;

  /// @inheritdoc IBasePluginV1Factory
  address public defaultBlastGovernor;

  /// @dev values of constants for sigmoids in fee calculation formula
  AlgebraFeeConfiguration public override defaultFeeConfiguration;

  /// @inheritdoc IBasePluginV1Factory
  mapping(address => address) public override pluginByPool;

  /// @inheritdoc IBasePluginV1Factory
  address public override farmingAddress;

  /// @inheritdoc IBeacon
  address public override implementation;

  constructor(address _blastGovernor, address _algebraFactory, address _basePluginV1Implementation) {
    defaultBlastGovernor = _blastGovernor;

    algebraFactory = _algebraFactory;
    defaultFeeConfiguration = AdaptiveFee.initialFeeConfiguration();

    _setImplementation(_basePluginV1Implementation);
  }

  /// @inheritdoc IAlgebraPluginFactory
  function createPlugin(address pool, address, address) external override returns (address) {
    return _createPlugin(pool);
  }

  function createPluginForExistingPool(address token0, address token1) external override returns (address) {
    IAlgebraFactory factory = IAlgebraFactory(algebraFactory);
    require(factory.hasRoleOrOwner(factory.POOLS_ADMINISTRATOR_ROLE(), msg.sender));

    address pool = factory.poolByPair(token0, token1);
    require(pool != address(0), 'Pool not exist');

    return _createPlugin(pool);
  }

  function setPluginForPool(address pool, address plugin) external {
    pluginByPool[pool] = plugin;
  }

  /// @inheritdoc IBasePluginV1Factory
  function setDefaultBlastGovernor(address defaultBlastGovernor_) external override {
    defaultBlastGovernor = defaultBlastGovernor_;
    emit DefaultBlastGovernor(defaultBlastGovernor_);
  }

  function _createPlugin(address pool) internal returns (address) {
    MockTimeAlgebraBasePluginV1 volatilityOracle = MockTimeAlgebraBasePluginV1(address(new BeaconProxy(address(this), '')));
    volatilityOracle.initialize(defaultBlastGovernor, pool, algebraFactory, address(this));
    volatilityOracle.changeFeeConfiguration(defaultFeeConfiguration);
    pluginByPool[pool] = address(volatilityOracle);
    return address(volatilityOracle);
  }

  /// @inheritdoc IBasePluginV1Factory
  function setDefaultFeeConfiguration(AlgebraFeeConfiguration calldata newConfig) external override {
    AdaptiveFee.validateFeeConfiguration(newConfig);
    defaultFeeConfiguration = newConfig;
    emit DefaultFeeConfiguration(newConfig);
  }

  /// @inheritdoc IBasePluginV1Factory
  function setFarmingAddress(address newFarmingAddress) external override {
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
  function upgradeTo(address newImplementation) external {
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
