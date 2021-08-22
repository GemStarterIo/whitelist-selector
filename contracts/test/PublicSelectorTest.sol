// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "../PublicSelector.sol";

contract PublicSelectorTest is PublicSelector {
    using EnumerableSet for EnumerableSet.UintSet;

    constructor(uint256 random) PublicSelector(address(0), address(0), keccak256("random"), 1) {
        randomResult = random;
        stepsBeforeSelection.add(1);
    }
}
