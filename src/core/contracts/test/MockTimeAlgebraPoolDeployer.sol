// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.20;

import '../interfaces/IAlgebraPoolDeployer.sol';

import './MockTimeAlgebraPool.sol';

contract MockTimeAlgebraPoolDeployer {
  address private factory;

  address private tempBlastGovernor;
  address private tempPlugin;
  address private tempToken0;
  address private tempToken1;

  bytes32 public immutable mockPoolHash;

  constructor() {
    mockPoolHash = keccak256(type(MockTimeAlgebraPool).creationCode);
  }

  function getDeployParameters() external view returns (address _blastGovernor, address _plugin, address _factory, address _token0, address _token1) {
    (_blastGovernor, _plugin, _token0, _token1) = (tempBlastGovernor, tempPlugin, tempToken0, tempToken1);
    _factory = factory;
  }

  event PoolDeployed(address pool);

  function deployMock(address blastGovernor, address _factory, address token0, address token1) external returns (address pool) {
    factory = _factory;
    (tempBlastGovernor, tempPlugin, tempToken0, tempToken1) = (blastGovernor, address(0), token0, token1);

    pool = address(new MockTimeAlgebraPool{salt: keccak256(abi.encode(token0, token1))}());
    (tempBlastGovernor, tempPlugin, tempToken0, tempToken1) = (address(0), address(0), address(0), address(0));
    emit PoolDeployed(pool);
  }

  /// @notice Deterministically computes the pool address given the factory and PoolKey
  /// @param token0 first token
  /// @param token1 second token
  /// @return pool The contract address of the V3 pool
  function computeAddress(address token0, address token1) public view returns (address pool) {
    unchecked {
      pool = address(uint160(uint256(keccak256(abi.encodePacked(hex'ff', address(this), keccak256(abi.encode(token0, token1)), mockPoolHash)))));
    }
  }
}
