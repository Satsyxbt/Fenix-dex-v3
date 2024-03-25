// SPDX-License-Identifier: MIT
pragma solidity =0.8.20;
import {BlastERC20RebasingManage} from '../base/BlastERC20RebasingManage.sol';

contract BlastERC20RebasingManageMock is BlastERC20RebasingManage {
  constructor(address blastGovernor_, address blastPoints_, address blastPointsOperator_) {
    __BlastERC20RebasingManage__init(blastGovernor_, blastPoints_, blastPointsOperator_);
  }

  function _checkAccessForManageBlastERC20Rebasing() internal virtual override {}
}
