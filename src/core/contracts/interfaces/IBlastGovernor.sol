// SPDX-License-Identifier: MIT
pragma solidity =0.8.20;

/**
 * @title IBlastGovernor
 * @dev Interface for the BlastGovernor contract.
 */
interface IBlastGovernor {
  /**
   * @notice Adds a gas holder.
   * @dev Adds a contract to the list of gas holders.
   * @param contractAddress_ The address of the gas holder contract.
   */
  function addGasHolder(address contractAddress_) external;
}
