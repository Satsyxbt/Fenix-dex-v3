// SPDX-License-Identifier: BUSL-1.1
pragma solidity =0.8.20;

import './libraries/Constants.sol';

import './interfaces/IAlgebraFactory.sol';
import './interfaces/IAlgebraPoolDeployer.sol';
import './interfaces/IBlastERC20RebasingManage.sol';

import './interfaces/vault/IAlgebraVaultFactory.sol';
import './interfaces/plugin/IAlgebraPluginFactory.sol';

import './AlgebraCommunityVault.sol';
import './base/BlastGovernorSetup.sol';

import '@openzeppelin/contracts/access/Ownable2Step.sol';
import '@openzeppelin/contracts/access/AccessControlEnumerable.sol';

/// @title Algebra factory
/// @notice Is used to deploy pools and its plugins
/// @dev Version: Algebra Integral 1.0
contract AlgebraFactory is IAlgebraFactory, Ownable2Step, AccessControlEnumerable, BlastGovernorSetup {
  /// @inheritdoc IAlgebraFactory
  bytes32 public constant override POOLS_ADMINISTRATOR_ROLE = keccak256('POOLS_ADMINISTRATOR'); // it`s here for the public visibility of the value

  /// @inheritdoc IAlgebraFactory
  bytes32 public constant override POOLS_CREATOR_ROLE = keccak256('POOLS_CREATOR'); // it`s here for the public visibility of the value

  /// @inheritdoc IAlgebraFactory
  /// @dev keccak256 of AlgebraPool init bytecode. Used to compute pool address deterministically
  bytes32 public constant override POOL_INIT_CODE_HASH = 0xf45e886a0794c1d80aeae5ab5befecd4f0f2b77c0cf627f7c46ec92dc1fa00e4;

  /// @inheritdoc IAlgebraFactory
  address public immutable override poolDeployer;

  /// @inheritdoc IAlgebraFactory
  address public override defaultBlastGovernor;

  /// @inheritdoc IAlgebraFactory
  address public override defaultBlastPoints;

  /// @inheritdoc IAlgebraFactory
  address public override defaultBlastPointsOperator;

  ///@inheritdoc IAlgebraFactory
  bool public override isPublicPoolCreationMode;

  /// @inheritdoc IAlgebraFactory
  uint16 public override defaultCommunityFee;

  /// @inheritdoc IAlgebraFactory
  uint16 public override defaultFee;

  /// @inheritdoc IAlgebraFactory
  int24 public override defaultTickspacing;

  /// @inheritdoc IAlgebraFactory
  uint256 public override renounceOwnershipStartTimestamp;

  /// @inheritdoc IAlgebraFactory
  IAlgebraPluginFactory public override defaultPluginFactory;

  /// @inheritdoc IAlgebraFactory
  IAlgebraVaultFactory public override vaultFactory;

  /// @inheritdoc IAlgebraFactory
  mapping(address => mapping(address => address)) public override poolByPair;

  /// @inheritdoc IAlgebraFactory
  mapping(address => YieldMode) public override configurationForBlastRebaseTokens;

  /// @inheritdoc IAlgebraFactory
  mapping(address => bool) public override isRebaseToken;

  /// @dev time delay before ownership renouncement can be finished
  uint256 private constant RENOUNCE_OWNERSHIP_DELAY = 1 days;

  constructor(address _blastGovernor, address _blastPoints, address _blastPointsOperaotor, address _poolDeployer) {
    require(_poolDeployer != address(0));
    require(_blastPoints != address(0));
    require(_blastPointsOperaotor != address(0));

    __BlastGovernorSetup_init(_blastGovernor);

    defaultBlastGovernor = _blastGovernor;
    defaultBlastPoints = _blastPoints;
    defaultBlastPointsOperator = _blastPointsOperaotor;

    poolDeployer = _poolDeployer;
    defaultTickspacing = Constants.INIT_DEFAULT_TICK_SPACING;
    defaultFee = Constants.INIT_DEFAULT_FEE;

    _grantRole(POOLS_CREATOR_ROLE, msg.sender);

    emit DefaultTickspacing(Constants.INIT_DEFAULT_TICK_SPACING);
    emit DefaultFee(Constants.INIT_DEFAULT_FEE);
  }

  /// @inheritdoc IAlgebraFactory
  function owner() public view override(IAlgebraFactory, Ownable) returns (address) {
    return super.owner();
  }

  /// @inheritdoc IAlgebraFactory
  function hasRoleOrOwner(bytes32 role, address account) public view override returns (bool) {
    return (owner() == account || super.hasRole(role, account));
  }

  /// @inheritdoc IAlgebraFactory
  function defaultConfigurationForPool(
    address pool
  ) external view override returns (uint16 communityFee, int24 tickSpacing, uint16 fee, address communityVault) {
    if (address(vaultFactory) != address(0)) {
      communityVault = vaultFactory.getVaultForPool(pool);
    }
    return (defaultCommunityFee, defaultTickspacing, defaultFee, communityVault);
  }

  /// @inheritdoc IAlgebraFactory
  function computePoolAddress(address token0, address token1) public view override returns (address pool) {
    pool = address(uint160(uint256(keccak256(abi.encodePacked(hex'ff', poolDeployer, keccak256(abi.encode(token0, token1)), POOL_INIT_CODE_HASH)))));
  }

  /// @inheritdoc IAlgebraFactory
  function createPool(address tokenA, address tokenB) external override returns (address pool) {
    if (!isPublicPoolCreationMode) {
      _checkRole(POOLS_CREATOR_ROLE);
    }
    require(tokenA != tokenB);
    (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    require(token0 != address(0));
    require(poolByPair[token0][token1] == address(0));

    address defaultPlugin;
    if (address(defaultPluginFactory) != address(0)) {
      defaultPlugin = defaultPluginFactory.createPlugin(computePoolAddress(token0, token1), token0, token1);
    }

    pool = IAlgebraPoolDeployer(poolDeployer).deploy(
      defaultBlastGovernor,
      defaultBlastPoints,
      defaultBlastPointsOperator,
      defaultPlugin,
      token0,
      token1
    );

    if (isRebaseToken[token0]) {
      IBlastERC20RebasingManage(pool).configure(token0, configurationForBlastRebaseTokens[token0]);
    }

    if (isRebaseToken[token1]) {
      IBlastERC20RebasingManage(pool).configure(token1, configurationForBlastRebaseTokens[token1]);
    }

    poolByPair[token0][token1] = pool; // to avoid future addresses comparison we are populating the mapping twice
    poolByPair[token1][token0] = pool;
    emit Pool(token0, token1, pool);

    if (address(vaultFactory) != address(0)) {
      vaultFactory.createVaultForPool(pool);
      vaultFactory.afterPoolInitialize(pool);
    }
  }

  /// @inheritdoc IAlgebraFactory
  function setConfigurationForRebaseToken(address token_, bool isRebase_, YieldMode mode_) external override onlyOwner {
    isRebaseToken[token_] = isRebase_;
    configurationForBlastRebaseTokens[token_] = mode_;
    emit ConfigurationForRebaseToken(token_, isRebase_, mode_);
  }

  /// @inheritdoc IAlgebraFactory
  function setDefaultBlastGovernor(address defaultBlastGovernor_) external override onlyOwner {
    require(defaultBlastGovernor_ != address(0));
    defaultBlastGovernor = defaultBlastGovernor_;
    emit DefaultBlastGovernor(defaultBlastGovernor_);
  }

  /// @inheritdoc IAlgebraFactory
  function setDefaultBlastPoints(address defaultBlastPoints_) external override onlyOwner {
    require(defaultBlastPoints_ != address(0));
    defaultBlastPoints = defaultBlastPoints_;
    emit DefaultBlastPoints(defaultBlastPoints_);
  }

  /// @inheritdoc IAlgebraFactory
  function setDefaultBlastPointsOperator(address defaultBlastPointsOperator_) external override onlyOwner {
    require(defaultBlastPointsOperator_ != address(0));
    defaultBlastPointsOperator = defaultBlastPointsOperator_;
    emit DefaultBlastPointsOperator(defaultBlastPointsOperator_);
  }

  /// @inheritdoc IAlgebraFactory
  function setIsPublicPoolCreationMode(bool mode_) external override onlyOwner {
    isPublicPoolCreationMode = mode_;
    emit PublicPoolCreationMode(mode_);
  }

  /// @inheritdoc IAlgebraFactory
  function setDefaultCommunityFee(uint16 newDefaultCommunityFee) external override onlyOwner {
    require(newDefaultCommunityFee <= Constants.MAX_COMMUNITY_FEE);
    require(defaultCommunityFee != newDefaultCommunityFee);
    if (newDefaultCommunityFee != 0) require(address(vaultFactory) != address(0));
    defaultCommunityFee = newDefaultCommunityFee;
    emit DefaultCommunityFee(newDefaultCommunityFee);
  }

  /// @inheritdoc IAlgebraFactory
  function setDefaultFee(uint16 newDefaultFee) external override onlyOwner {
    require(newDefaultFee <= Constants.MAX_DEFAULT_FEE);
    require(defaultFee != newDefaultFee);
    defaultFee = newDefaultFee;
    emit DefaultFee(newDefaultFee);
  }

  /// @inheritdoc IAlgebraFactory
  function setDefaultTickspacing(int24 newDefaultTickspacing) external override onlyOwner {
    require(newDefaultTickspacing >= Constants.MIN_TICK_SPACING);
    require(newDefaultTickspacing <= Constants.MAX_TICK_SPACING);
    require(newDefaultTickspacing != defaultTickspacing);
    defaultTickspacing = newDefaultTickspacing;
    emit DefaultTickspacing(newDefaultTickspacing);
  }

  /// @inheritdoc IAlgebraFactory
  function setDefaultPluginFactory(address newDefaultPluginFactory) external override onlyOwner {
    require(newDefaultPluginFactory != address(defaultPluginFactory));
    defaultPluginFactory = IAlgebraPluginFactory(newDefaultPluginFactory);
    emit DefaultPluginFactory(newDefaultPluginFactory);
  }

  /// @inheritdoc IAlgebraFactory
  function setVaultFactory(address newVaultFactory) external override onlyOwner {
    require(newVaultFactory != address(vaultFactory));
    if (newVaultFactory == address(0)) require(defaultCommunityFee == 0);
    vaultFactory = IAlgebraVaultFactory(newVaultFactory);
    emit VaultFactory(newVaultFactory);
  }

  /// @inheritdoc IAlgebraFactory
  function startRenounceOwnership() external override onlyOwner {
    require(renounceOwnershipStartTimestamp == 0);
    renounceOwnershipStartTimestamp = block.timestamp;
    emit RenounceOwnershipStart(renounceOwnershipStartTimestamp, renounceOwnershipStartTimestamp + RENOUNCE_OWNERSHIP_DELAY);
  }

  /// @inheritdoc IAlgebraFactory
  function stopRenounceOwnership() external override onlyOwner {
    require(renounceOwnershipStartTimestamp != 0);
    renounceOwnershipStartTimestamp = 0;
    emit RenounceOwnershipStop(block.timestamp);
  }

  /// @dev Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore.
  /// Can only be called by the current owner if RENOUNCE_OWNERSHIP_DELAY seconds
  /// have passed since the call to the startRenounceOwnership() function.
  function renounceOwnership() public override onlyOwner {
    require(renounceOwnershipStartTimestamp != 0);
    require(block.timestamp - renounceOwnershipStartTimestamp >= RENOUNCE_OWNERSHIP_DELAY);
    renounceOwnershipStartTimestamp = 0;

    super.renounceOwnership();
    emit RenounceOwnershipFinish(block.timestamp);
  }

  /// @dev Transfers ownership of the contract to a new account (`newOwner`).
  /// Modified to fit with the role mechanism.
  function _transferOwnership(address newOwner) internal override {
    _revokeRole(DEFAULT_ADMIN_ROLE, owner());
    super._transferOwnership(newOwner);
    if (owner() != address(0)) {
      _grantRole(DEFAULT_ADMIN_ROLE, owner());
    }
  }
}
