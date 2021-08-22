import { waffle } from "hardhat";
import { expect } from "chai";

import PublicSelectorTestArtifact from "../artifacts/contracts/test/PublicSelectorTest.sol/PublicSelectorTest.json";

import { PublicSelectorTest } from "../typechain";
import { Wallet } from "ethers";

const { provider, deployContract } = waffle;

describe("PublicSelector", () => {
  const [deployer] = provider.getWallets() as Wallet[];

  let selector: PublicSelectorTest;

  async function makeSUT(_random: number = 1500100900): Promise<PublicSelectorTest> {
    return (await deployContract(deployer, PublicSelectorTestArtifact, [_random])) as PublicSelectorTest;
  }

  describe("select winners ", () => {
    beforeEach(async () => {
      selector = await makeSUT();
    });

    it("it should pass with happy path", async () => {
      await selector.setTicketsNumber(6000);
      expect(await selector.ticketsCount()).to.be.equal(6000);

      await selector.setParticipantsListLink("https://docs.google.com/document/d/1JPrfdhvS3ctn7YRk7MNykMqmpEEIBXxWh6BUX-XiaiQ");
      expect(await selector.participantsListLink()).to.be.equal(
        "https://docs.google.com/document/d/1JPrfdhvS3ctn7YRk7MNykMqmpEEIBXxWh6BUX-XiaiQ"
      );

      await selector.setParticipantsListSha256("b7cda03c3de31284ec02af2134e6e5d12bc94a4155f0fe5b0d23a75749eaa726");
      expect(await selector.participantsListSha256()).to.be.equal("b7cda03c3de31284ec02af2134e6e5d12bc94a4155f0fe5b0d23a75749eaa726");

      await selector.setParticipantsListSha256("b7cda03c3de31284ec02af2134e6e5d12bc94a4155f0fe5b0d23a75749eaa726");
      await selector.selectWinners(100);

      expect(await selector.getWinnersInRange(0, 49)).to.be.lengthOf(50);
      expect(await selector.getWinnersInRange(49, 99)).to.be.lengthOf(51);

      await expect(selector.getWinnersInRange(49, 100)).to.be.revertedWith("Incorrect range");
      await expect(selector.getWinnersInRange(40, 30)).to.be.revertedWith("Incorrect range");

      await selector.selectWinners(100);

      await expect(selector.setTicketsNumber(6000)).to.be.revertedWith("Selection performed");
      await expect(selector.setParticipantsListLink("https://docs.google.com/")).to.be.revertedWith("Selection performed");
      await expect(selector.setParticipantsListSha256("b7cda03c3de31284ec02af2134e6e5")).to.be.revertedWith("Selection performed");

      expect(await selector.getWinners()).to.be.lengthOf(200);

      await expect(selector.selectWinners(100)).to.emit(selector, "WinnerSelected");

      expect(await selector.getWinners()).to.be.lengthOf(300);

      await selector.selectWinners(100);
      await selector.selectWinners(100);

      expect(await selector.getWinners()).to.be.lengthOf(500);
    });
  });
});
