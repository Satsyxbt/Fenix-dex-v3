// SPDX-License-Identifier: MIT
pragma solidity =0.8.20;

import {YieldMode} from './IERC20Rebasing.sol';

/**
 * @title IBlastRebasingTokensGovernor
 * @dev Interface for the BlastRebasingTokensGovernor contract.
 */
interface IBlastRebasingTokensGovernor {
  /**
   * @notice Adds a token holder.
   * @dev Adds a contract to the list of token holders.
   * @param token_ The address of the token.
   * @param contractAddress_ The address of the token holder contract.
   */
  function addTokenHolder(address token_, address contractAddress_) external;
}
