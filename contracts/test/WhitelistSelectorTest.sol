// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "../WhitelistSelector.sol";

contract WhitelistSelectorTest is WhitelistSelector {
    using EnumerableSet for EnumerableSet.UintSet;

    constructor(uint256 random) WhitelistSelector(address(0), address(0), keccak256("random"), 1) {
        randomResult = random;
        stepsBeforeWLSelection.add(1);
    }
}
