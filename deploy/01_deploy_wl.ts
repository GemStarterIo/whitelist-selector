import chalk from "chalk";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployResult } from "hardhat-deploy/types";
import { BigNumber } from "ethers";

const displayLogs = true;

function dim(logMessage: string) {
  if (displayLogs) {
    console.log(chalk.dim(logMessage));
  }
}

function cyan(logMessage: string) {
  if (displayLogs) {
    console.log(chalk.cyan(logMessage));
  }
}

function yellow(logMessage: string) {
  if (displayLogs) {
    console.log(chalk.yellow(logMessage));
  }
}

function green(logMessage: string) {
  if (displayLogs) {
    console.log(chalk.green(logMessage));
  }
}

function displayResult(name: string, result: DeployResult) {
  if (!result.newlyDeployed) {
    yellow(`Re-used existing ${name} at ${result.address}`);
  } else {
    green(`${name} deployed at ${result.address}`);
  }
}

const chainName = (chainId: number) => {
  switch (chainId) {
    case 1:
      return "Mainnet";
    case 4:
      return "Rinkeby";
    case 137:
      return "Polygon";
    default:
      return "Unknown";
  }
};

const chainLinkData = (chainId: number) => {
  switch (chainId) {
    case 1:
      return {
        vrfCoordinator: "0x3d2341ADb2D31f1c5530cDC622016af293177AE0",
        linkAddress: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
        keyHash: "0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da",
        fee: BigNumber.from(1).mul(BigNumber.from(10).pow(14)), // 0.0001 LINK
      };
    case 4:
      return {
        vrfCoordinator: "0x3d2341ADb2D31f1c5530cDC622016af293177AE0",
        linkAddress: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
        keyHash: "0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da",
        fee: BigNumber.from(1).mul(BigNumber.from(10).pow(14)), // 0.0001 LINK
      };
    case 137:
      return {
        vrfCoordinator: "0x3d2341ADb2D31f1c5530cDC622016af293177AE0",
        linkAddress: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
        keyHash: "0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da",
        fee: BigNumber.from(1).mul(BigNumber.from(10).pow(14)), // 0.0001 LINK
      };
    default:
      return {
        vrfCoordinator: "0x3d2341ADb2D31f1c5530cDC622016af293177AE0",
        linkAddress: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
        keyHash: "0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da",
        fee: BigNumber.from(1).mul(BigNumber.from(10).pow(14)), // 0.0001 LINK
      };
  }
};

const deployFunction: unknown = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, getChainId, ethers } = hre;
  const { deploy } = deployments;

  const { deployer, owner, deployer2 } = await getNamedAccounts();
  const signers = await ethers.getSigners();

  const chainId = parseInt(await getChainId());

  // 31337 is unit testing, 1337 is for coverage
  const isTestEnvironment = chainId === 31337 || chainId === 1337;

  dim("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  dim("Synapse Network Whitelist - Deploy Script");
  dim("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");

  dim(`network: ${chainName(chainId)} (${isTestEnvironment ? "local" : "remote"})`);
  dim(`deployer: ${deployer2}`);

  cyan("\nDeploying WhitelistSelector...");

  const linkData = chainLinkData(chainId);

  const whitelistDeployResult = await deploy("WhitelistSelector", {
    from: deployer2,
    args: [linkData.vrfCoordinator, linkData.linkAddress, linkData.keyHash, linkData.fee],
    skipIfAlreadyDeployed: true,
  });

  displayResult("WhitelistSelector", whitelistDeployResult);

  const whitelistContract = await ethers.getContractAt("WhitelistSelector", whitelistDeployResult.address);

  console.log(await whitelistContract.randomResult());
  console.log(await whitelistContract.previousWinnerSeed());

  const linkContract = await ethers.getContractAt("LinkTokenInterface", linkData.linkAddress);
  const linkBalance = await linkContract.balanceOf(whitelistDeployResult.address);

  if (linkBalance < linkData.fee) {
    const options = { gasPrice: ethers.utils.parseUnits("30", "gwei"), gasLimit: 150000, value: 0 };
    const transaction = await linkContract.connect(signers[0]).transfer(whitelistDeployResult.address, linkData.fee, options);
    console.log(transaction);
    const result = await transaction.wait(10);
    console.log(result);
  }

  green(`Done!`);
};

export default deployFunction;
