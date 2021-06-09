import { waffle } from "hardhat";
import { expect } from "chai";

import WhitelistSelectorTestArtifact from "../artifacts/contracts/test/WhitelistSelectorTest.sol/WhitelistSelectorTest.json";

import { WhitelistSelectorTest } from "../typechain";
import { Wallet } from "ethers";

const { provider, deployContract } = waffle;

describe("WhitelistSelector", () => {
  const [deployer] = provider.getWallets() as Wallet[];

  let whitelistSelector: WhitelistSelectorTest;

  async function makeSUT(_random: number = 1500100900): Promise<WhitelistSelectorTest> {
    return (await deployContract(deployer, WhitelistSelectorTestArtifact, [_random])) as WhitelistSelectorTest;
  }

  describe("select KYC winners ", () => {
    beforeEach(async () => {
      whitelistSelector = await makeSUT();
    });

    it("it should pass with happy path", async () => {
      // KYC
      await whitelistSelector.setTicketsNumber(6000);
      expect(await whitelistSelector.ticketsCount()).to.be.equal(6000);

      await whitelistSelector.setParticipantsListLink("https://docs.google.com/document/d/1JPrfdhvS3ctn7YRk7MNykMqmpEEIBXxWh6BUX-XiaiQ");
      expect(await whitelistSelector.participantsListLink()).to.be.equal(
        "https://docs.google.com/document/d/1JPrfdhvS3ctn7YRk7MNykMqmpEEIBXxWh6BUX-XiaiQ"
      );

      await whitelistSelector.setParticipantsListSha256("b7cda03c3de31284ec02af2134e6e5d12bc94a4155f0fe5b0d23a75749eaa726");
      expect(await whitelistSelector.participantsListSha256()).to.be.equal("b7cda03c3de31284ec02af2134e6e5d12bc94a4155f0fe5b0d23a75749eaa726");

      await whitelistSelector.setParticipantsListSha256("b7cda03c3de31284ec02af2134e6e5d12bc94a4155f0fe5b0d23a75749eaa726");
      await whitelistSelector.selectKycWinners(100);

      expect(await whitelistSelector.getKycWinnersInRange(0, 49)).to.be.lengthOf(50);
      expect(await whitelistSelector.getKycWinnersInRange(49, 99)).to.be.lengthOf(51);

      await expect(whitelistSelector.getKycWinnersInRange(49, 100)).to.be.revertedWith("Incorrect range");
      await expect(whitelistSelector.getKycWinnersInRange(40, 30)).to.be.revertedWith("Incorrect range");

      await whitelistSelector.selectKycWinners(100);

      await expect(whitelistSelector.setTicketsNumber(6000)).to.be.revertedWith("KYC selection performed");
      await expect(whitelistSelector.setParticipantsListLink("https://docs.google.com/")).to.be.revertedWith("KYC selection performed");
      await expect(whitelistSelector.setParticipantsListSha256("b7cda03c3de31284ec02af2134e6e5")).to.be.revertedWith("KYC selection performed");

      expect(await whitelistSelector.getKycWinners()).to.be.lengthOf(200);

      await expect(whitelistSelector.selectKycWinners(100)).to.emit(whitelistSelector, "KycWinnerSelected");

      expect(await whitelistSelector.getKycWinners()).to.be.lengthOf(300);

      await whitelistSelector.selectKycWinners(100);
      await whitelistSelector.selectKycWinners(100);

      await expect(whitelistSelector.selectWLWinners(100)).to.be.revertedWith("WL: KYC not finished");

      await whitelistSelector.finishKYCSelection();

      await expect(whitelistSelector.selectKycWinners(100)).to.be.revertedWith("KYC: No more");

      expect(await whitelistSelector.getKycWinners()).to.be.lengthOf(500);

      // WL

      await expect(whitelistSelector.selectWLWinners(100)).to.be.revertedWith("WL: Not all steps performed");

      await whitelistSelector.setKycNumber(350);
      expect(await whitelistSelector.kycCount()).to.be.equal(350);

      await whitelistSelector.setWlLimit(200);
      expect(await whitelistSelector.wlLimit()).to.be.equal(200);

      await whitelistSelector.setKycListLink("https://docs.google.com/document/d/1JPrfdhvS3ctn7YRk7MN");
      expect(await whitelistSelector.kycListLink()).to.be.equal("https://docs.google.com/document/d/1JPrfdhvS3ctn7YRk7MN");

      await whitelistSelector.setKycListSha256("b7cda03c3de31284ec02af2134e6e5d12bc94a4155f0f");
      expect(await whitelistSelector.kycListSha256()).to.be.equal("b7cda03c3de31284ec02af2134e6e5d12bc94a4155f0f");

      await whitelistSelector.setKycListSha256("b7cda03c3de31284ec02af2134e6e5d12bc94a4155f0f");

      await whitelistSelector.selectWLWinners(100);

      expect(await whitelistSelector.getWLWinners()).to.be.lengthOf(100);
      expect(await whitelistSelector.getWLWinnersInRange(0, 49)).to.be.lengthOf(50);
      expect(await whitelistSelector.getWLWinnersInRange(49, 99)).to.be.lengthOf(51);

      await expect(whitelistSelector.getWLWinnersInRange(49, 100)).to.be.revertedWith("Incorrect range");
      await expect(whitelistSelector.getWLWinnersInRange(40, 30)).to.be.revertedWith("Incorrect range");

      await expect(whitelistSelector.setKycNumber(6000)).to.be.revertedWith("WL selection performed");
      await expect(whitelistSelector.setWlLimit(6000)).to.be.revertedWith("WL selection performed");
      await expect(whitelistSelector.setKycListLink("https://docs.google.com/")).to.be.revertedWith("WL selection performed");
      await expect(whitelistSelector.setKycListSha256("b7cda03c3de31284ec02af2134e6e5")).to.be.revertedWith("WL selection performed");

      await whitelistSelector.selectWLWinners(99);

      await expect(whitelistSelector.selectWLReserve(99)).to.be.revertedWith("WL: select more winners");

      await expect(whitelistSelector.selectWLWinners(2)).to.be.revertedWith("WL: No more winners");
      await expect(whitelistSelector.selectWLWinners(1)).to.emit(whitelistSelector, "WLWinnerSelected");
      await expect(whitelistSelector.selectWLWinners(1)).to.be.revertedWith("WL: No more winners");

      await whitelistSelector.selectWLReserve(100);

      expect(await whitelistSelector.getWLReserve()).to.be.lengthOf(100);
      expect(await whitelistSelector.getWLReserveInRange(0, 49)).to.be.lengthOf(50);
      expect(await whitelistSelector.getWLReserveInRange(49, 99)).to.be.lengthOf(51);

      await expect(whitelistSelector.getWLReserveInRange(49, 100)).to.be.revertedWith("Incorrect range");
      await expect(whitelistSelector.getWLReserveInRange(40, 30)).to.be.revertedWith("Incorrect range");
    });
  });
});
