// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./external/chainlink/VRFConsumerBase.sol";
import "./external/openzeppelin/EnumerableSet.sol";
import "./abstract/Ownable.sol";
import "./libraries/SafeERC20.sol";

contract WhitelistSelector is Ownable, VRFConsumerBase {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.UintSet;

    // WL step

    event WLWinnerSelected(uint256 timestamp, uint256 wlWinner);
    event WLReserveSelected(uint256 timestamp, uint256 wlWinner);

    uint256 public kycCount;
    uint256 public wlLimit;

    string public kycListLink;
    string public kycListSha256;

    EnumerableSet.UintSet private wlWinners;
    EnumerableSet.UintSet private wlReserve;

    bool public wlWinnersSelected = false;
    EnumerableSet.UintSet internal stepsBeforeWLSelection;

    // Chainlink + Randomness

    bytes32 internal keyHash;
    uint256 internal fee;

    uint256 public randomResult;
    uint256 public previousWinnerSeed;

    /**
     * Constructor inherits VRFConsumerBase
     */
    constructor(
        address _vrfCoordinator,
        address _link,
        bytes32 _keyHash,
        uint256 _fee
    )
        Ownable(msg.sender)
        VRFConsumerBase(
            _vrfCoordinator, // VRF Coordinator
            _link // LINK Token
        )
    {
        keyHash = _keyHash;
        fee = _fee; // LINK fee
    }

    /// @notice Allows owner to set the VRF keyHash
    /// @param _keyHash The keyHash to be used by the VRF
    function setKeyHash(bytes32 _keyHash) external onlyOwner {
        keyHash = _keyHash;
    }

    /// @notice Allows owner to set the fee per request required by the VRF
    /// @param _fee The fee to be charged for a request
    function setFee(uint256 _fee) external onlyOwner {
        fee = _fee;
    }

    /**
     * Requests randomness
     */
    function getRandomNumber() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - provide LINK to the contract");
        return requestRandomness(keyHash, fee);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness;
        if (!stepsBeforeWLSelection.contains(1)) {
            stepsBeforeWLSelection.add(1);
        }
    }

    function setKycNumber(uint256 number) public onlyOwner {
        require(!wlWinnersSelected, "WL selection performed");
        kycCount = number;
        if (!stepsBeforeWLSelection.contains(5)) {
            stepsBeforeWLSelection.add(5);
        }
    }

    function setWlLimit(uint256 limit) public onlyOwner {
        require(!wlWinnersSelected, "WL selection performed");
        wlLimit = limit;
        if (!stepsBeforeWLSelection.contains(4)) {
            stepsBeforeWLSelection.add(4);
        }
    }

    function setKycListLink(string memory link) public onlyOwner {
        require(!wlWinnersSelected, "WL selection performed");
        kycListLink = link;
        if (!stepsBeforeWLSelection.contains(2)) {
            stepsBeforeWLSelection.add(2);
        }
    }

    function setKycListSha256(string memory sha256Hash) public onlyOwner {
        require(!wlWinnersSelected, "WL selection performed");
        kycListSha256 = sha256Hash;
        if (!stepsBeforeWLSelection.contains(3)) {
            stepsBeforeWLSelection.add(3);
        }
    }

    function selectWLWinners(uint256 count) public onlyOwner {
        require(stepsBeforeWLSelection.length() == 5, "WL: Not all steps performed");
        require((count + wlWinners.length()) <= wlLimit, "WL: No more winners");

        if (previousWinnerSeed == 0) {
            previousWinnerSeed = randomResult;
        }

        for (uint256 i = 0; i < count; i++) {
            uint256 winnerSeed;
            uint256 winnerIndex;

            bool winnerSelected = false;
            uint256 nonce = 0;
            do {
                winnerSeed = uint256(keccak256(abi.encodePacked(previousWinnerSeed, i, nonce)));
                winnerIndex = (winnerSeed % kycCount) + 1;
                nonce++;

                winnerSelected = !wlWinners.contains(winnerIndex);
            } while (!winnerSelected);

            wlWinners.add(winnerIndex);
            previousWinnerSeed = winnerSeed;

            emit WLWinnerSelected(block.timestamp, winnerIndex);
        }

        wlWinnersSelected = true;
    }

    function getWLWinners() external view returns (uint256[] memory) {
        uint256[] memory winners = new uint256[](wlWinners.length());

        for (uint256 i = 0; i < wlWinners.length(); i++) {
            winners[i] = wlWinners.at(i);
        }

        return winners;
    }

    function getWLWinnersInRange(uint256 from, uint256 to) external view returns (uint256[] memory) {
        require(from < to, "Incorrect range");
        require(to < wlWinners.length(), "Incorrect range");

        uint256[] memory winners = new uint256[](to - from + 1);

        for (uint256 i = 0; i <= to - from; i++) {
            winners[i] = wlWinners.at(i + from);
        }

        return winners;
    }

    function selectWLReserve(uint256 count) public onlyOwner {
        require(wlWinnersSelected, "WL: selection not performed");
        require(wlWinners.length() == wlLimit, "WL: select more winners");
        require((count + wlWinners.length() + wlReserve.length()) <= kycCount, "WL: No more");

        for (uint256 i = 0; i < count; i++) {
            uint256 winnerSeed;
            uint256 winnerIndex;

            bool winnerSelected = false;
            uint256 nonce = 0;
            do {
                winnerSeed = uint256(keccak256(abi.encodePacked(previousWinnerSeed, i, nonce)));
                winnerIndex = (winnerSeed % kycCount) + 1;
                nonce++;

                winnerSelected = !wlWinners.contains(winnerIndex) && !wlReserve.contains(winnerIndex);
            } while (!winnerSelected);

            wlReserve.add(winnerIndex);
            previousWinnerSeed = winnerSeed;

            emit WLReserveSelected(block.timestamp, winnerIndex);
        }
    }

    function getWLReserve() external view returns (uint256[] memory) {
        uint256[] memory winners = new uint256[](wlReserve.length());

        for (uint256 i = 0; i < wlReserve.length(); i++) {
            winners[i] = wlReserve.at(i);
        }

        return winners;
    }

    function getWLReserveInRange(uint256 from, uint256 to) external view returns (uint256[] memory) {
        require(from < to, "Incorrect range");
        require(to < wlReserve.length(), "Incorrect range");

        uint256[] memory winners = new uint256[](to - from + 1);

        for (uint256 i = 0; i <= to - from; i++) {
            winners[i] = wlReserve.at(i + from);
        }

        return winners;
    }

    function recoverErc20(address token) external onlyOwner {
        uint256 amount = IERC20(token).balanceOf(address(this));
        if (amount > 0) {
            IERC20(token).safeTransfer(owner, amount);
        }
    }

    function recover() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
