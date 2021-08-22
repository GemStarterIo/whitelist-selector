// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "./PublicSelector.sol";

contract PublicKRSelector is PublicSelector {
    constructor(
        address _vrfCoordinator,
        address _link,
        bytes32 _keyHash,
        uint256 _fee
    ) PublicSelector(_vrfCoordinator, _link, _keyHash, _fee) {}
}
