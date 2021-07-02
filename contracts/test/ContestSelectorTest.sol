// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "../ContestSelector.sol";

contract ContestSelectorTest is ContestSelector {
    using EnumerableSet for EnumerableSet.UintSet;

    constructor(uint256 random) ContestSelector(address(0), address(0), keccak256("random"), 1) {
        randomResult = random;
        stepsBeforeContestSelection.add(1);
    }
}
