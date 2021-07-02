// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "./external/chainlink/VRFConsumerBase.sol";
import "./external/openzeppelin/EnumerableSet.sol";
import "./abstract/Ownable.sol";
import "./libraries/SafeERC20.sol";

contract ContestSelector is Ownable, VRFConsumerBase {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.UintSet;

    // Contest step

    event ContestWinnerSelected(uint256 timestamp, uint256 contestWinner);

    uint256 public ticketsCount;
    string public participantsListLink;
    string public participantsListSha256;

    EnumerableSet.UintSet private contestWinners;

    bool public contestWinnersSelected = false;
    EnumerableSet.UintSet internal stepsBeforeContestSelection;

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
        if (!stepsBeforeContestSelection.contains(1)) {
            stepsBeforeContestSelection.add(1);
        }
    }

    function setTicketsNumber(uint256 number) public onlyOwner {
        require(!contestWinnersSelected, "Contest selection performed");
        ticketsCount = number;
        if (!stepsBeforeContestSelection.contains(4)) {
            stepsBeforeContestSelection.add(4);
        }
    }

    function setParticipantsListLink(string memory link) public onlyOwner {
        require(!contestWinnersSelected, "Contest selection performed");
        participantsListLink = link;
        if (!stepsBeforeContestSelection.contains(2)) {
            stepsBeforeContestSelection.add(2);
        }
    }

    function setParticipantsListSha256(string memory sha256Hash) public onlyOwner {
        require(!contestWinnersSelected, "Contest selection performed");
        participantsListSha256 = sha256Hash;
        if (!stepsBeforeContestSelection.contains(3)) {
            stepsBeforeContestSelection.add(3);
        }
    }

    function selectContestWinners(uint256 count) public onlyOwner {
        require(stepsBeforeContestSelection.length() == 4, "Contest: Not all steps performed");
        require(randomResult != 0, "Contest: Chainlink data recheck");
        require((count + contestWinners.length()) <= ticketsCount, "Contest: Outside of ticket range");

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
                winnerIndex = (winnerSeed % ticketsCount) + 1;
                nonce++;

                winnerSelected = !contestWinners.contains(winnerIndex);
            } while (!winnerSelected);

            contestWinners.add(winnerIndex);
            previousWinnerSeed = winnerSeed;

            emit ContestWinnerSelected(block.timestamp, winnerIndex);
        }

        contestWinnersSelected = true;
    }

    function getContestWinners() external view returns (uint256[] memory) {
        uint256[] memory winners = new uint256[](contestWinners.length());

        for (uint256 i = 0; i < contestWinners.length(); i++) {
            winners[i] = contestWinners.at(i);
        }

        return winners;
    }

    function getContestWinnersInRange(uint256 from, uint256 to) external view returns (uint256[] memory) {
        require(from < to, "Incorrect range");
        require(to < contestWinners.length(), "Incorrect range");

        uint256[] memory winners = new uint256[](to - from + 1);

        for (uint256 i = 0; i <= to - from; i++) {
            winners[i] = contestWinners.at(i + from);
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
