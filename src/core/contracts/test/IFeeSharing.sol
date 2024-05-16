// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.20;

interface IFeeSharing {
  struct NftData {
    uint256 tokenId;
    bool registered;
    uint256 balanceUpdatedBlock;
  }

  function feeRecipient(address) external view returns (NftData memory);

  function balances(uint256) external view returns (uint256);

  function getTokenId(address) external view returns (uint256);

  function isRegistered(address) external view returns (bool);
}
