import { waffle } from "hardhat";
import { expect } from "chai";

import ContestSelectorTestArtifact from "../artifacts/contracts/test/ContestSelectorTest.sol/ContestSelectorTest.json";

import { ContestSelectorTest } from "../typechain";
import { Wallet } from "ethers";

const { provider, deployContract } = waffle;

describe("ContestSelector", () => {
  const [deployer] = provider.getWallets() as Wallet[];

  let contestSelector: ContestSelectorTest;

  async function makeSUT(_random: number = 1500100900): Promise<ContestSelectorTest> {
    return (await deployContract(deployer, ContestSelectorTestArtifact, [_random])) as ContestSelectorTest;
  }

  describe("select Contest winners ", () => {
    beforeEach(async () => {
      contestSelector = await makeSUT();
    });

    it("it should pass with happy path", async () => {
      // Contest
      await contestSelector.setTicketsNumber(6000);
      expect(await contestSelector.ticketsCount()).to.be.equal(6000);

      await contestSelector.setParticipantsListLink("https://docs.google.com/document/d/1JPrfdhvS3ctn7YRk7MNykMqmpEEIBXxWh6BUX-XiaiQ");
      expect(await contestSelector.participantsListLink()).to.be.equal(
        "https://docs.google.com/document/d/1JPrfdhvS3ctn7YRk7MNykMqmpEEIBXxWh6BUX-XiaiQ"
      );

      await contestSelector.setParticipantsListSha256("b7cda03c3de31284ec02af2134e6e5d12bc94a4155f0fe5b0d23a75749eaa726");
      expect(await contestSelector.participantsListSha256()).to.be.equal("b7cda03c3de31284ec02af2134e6e5d12bc94a4155f0fe5b0d23a75749eaa726");

      await contestSelector.setParticipantsListSha256("b7cda03c3de31284ec02af2134e6e5d12bc94a4155f0fe5b0d23a75749eaa726");
      await contestSelector.selectContestWinners(100);

      expect(await contestSelector.getContestWinnersInRange(0, 49)).to.be.lengthOf(50);
      expect(await contestSelector.getContestWinnersInRange(49, 99)).to.be.lengthOf(51);

      await expect(contestSelector.getContestWinnersInRange(49, 100)).to.be.revertedWith("Incorrect range");
      await expect(contestSelector.getContestWinnersInRange(40, 30)).to.be.revertedWith("Incorrect range");

      await contestSelector.selectContestWinners(100);

      await expect(contestSelector.setTicketsNumber(6000)).to.be.revertedWith("Contest selection performed");
      await expect(contestSelector.setParticipantsListLink("https://docs.google.com/")).to.be.revertedWith("Contest selection performed");
      await expect(contestSelector.setParticipantsListSha256("b7cda03c3de31284ec02af2134e6e5")).to.be.revertedWith(
        "Contest selection performed"
      );

      expect(await contestSelector.getContestWinners()).to.be.lengthOf(200);

      await expect(contestSelector.selectContestWinners(100)).to.emit(contestSelector, "ContestWinnerSelected");

      expect(await contestSelector.getContestWinners()).to.be.lengthOf(300);

      await contestSelector.selectContestWinners(100);
      await contestSelector.selectContestWinners(100);

      expect(await contestSelector.getContestWinners()).to.be.lengthOf(500);
    });
  });
});
