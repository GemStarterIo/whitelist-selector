import chalk from "chalk";
import { BigNumber } from "ethers";
import { DeployResult } from "hardhat-deploy/types";

export function getBigNumber(amount: number, decimals: number = 18): BigNumber {
  return BigNumber.from(amount).mul(BigNumber.from(10).pow(decimals));
}

export function dim(logMessage: string): void {
  console.log(chalk.dim(logMessage));
}

export function cyan(logMessage: string): void {
  console.log(chalk.cyan(logMessage));
}

export function yellow(logMessage: string): void {
  console.log(chalk.yellow(logMessage));
}

export function green(logMessage: string): void {
  console.log(chalk.green(logMessage));
}

export function displayResult(name: string, result: DeployResult): void {
  if (!result.newlyDeployed) {
    yellow(`Re-used existing ${name} at ${result.address}`);
  } else {
    green(`${name} deployed at ${result.address}`);
  }
}

export const chainLinkData = (chainId: number) => {
  switch (chainId) {
    case 1:
      return {
        vrfCoordinator: "0x3d2341ADb2D31f1c5530cDC622016af293177AE0",
        linkAddress: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
        keyHash: "0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da",
        fee: getBigNumber(1, 14), // 0.0001 LINK
      };
    case 4:
      return {
        vrfCoordinator: "0x3d2341ADb2D31f1c5530cDC622016af293177AE0",
        linkAddress: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
        keyHash: "0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da",
        fee: getBigNumber(1, 14), // 0.0001 LINK
      };
    case 137:
      return {
        vrfCoordinator: "0x3d2341ADb2D31f1c5530cDC622016af293177AE0",
        linkAddress: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
        keyHash: "0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da",
        fee: getBigNumber(1, 14), // 0.0001 LINK
      };
    default:
      return {
        vrfCoordinator: "0x3d2341ADb2D31f1c5530cDC622016af293177AE0",
        linkAddress: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
        keyHash: "0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da",
        fee: getBigNumber(1, 14), // 0.0001 LINK
      };
  }
};

export const chainName = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return "Mainnet";
    case 4:
      return "Rinkeby";
    case 56:
      return "BSC";
    case 97:
      return "BSCTestnet";
    case 137:
      return "Polygon";
    case 80001:
      return "Mumbai";
    default:
      return "Rinkeby";
  }
};
