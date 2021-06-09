import { ethers, network } from "hardhat";
import { Contract, ContractFactory, BigNumber } from "ethers";

import hre from "hardhat";

async function main(): Promise<void> {
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contract with the account:", await deployer.getAddress());
  console.log("Account balance: ", ethers.utils.formatEther(await deployer.getBalance()));

  const deployArgs = {
    polygon: {
      vrfCoordinator: "0x3d2341ADb2D31f1c5530cDC622016af293177AE0",
      linkAddress: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
      keyHash: "0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da",
      fee: BigNumber.from(1).mul(BigNumber.from(10).pow(14)), // 0.0001 LINK
    },
  };

  const WhitelistSelector: ContractFactory = await ethers.getContractFactory("WhitelistSelector");
  const whitelistSelector: Contract = await WhitelistSelector.deploy(
    deployArgs.polygon.vrfCoordinator,
    deployArgs.polygon.linkAddress,
    deployArgs.polygon.keyHash,
    deployArgs.polygon.fee
  );

  await whitelistSelector.deployed();
  await whitelistSelector.deployTransaction.wait(15);

  console.log("WhitelistSelector deployed to: ", whitelistSelector.address);

  await hre.run("verify:verify", {
    address: whitelistSelector.address,
    constructorArguments: [
      deployArgs.polygon.vrfCoordinator,
      deployArgs.polygon.linkAddress,
      deployArgs.polygon.keyHash,
      deployArgs.polygon.fee,
    ],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
