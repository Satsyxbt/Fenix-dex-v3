// SPDX-License-Identifier: MIT
pragma solidity =0.8.20;
import {BlastERC20RebasingManage} from '../base/BlastERC20RebasingManage.sol';

contract BlastERC20RebasingManageMock is BlastERC20RebasingManage {
  function _checkAccessForManageBlastERC20Rebasing() internal virtual override {}
}
