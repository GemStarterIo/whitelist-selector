import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { chainName, displayResult, dim, cyan, green, chainLinkData } from "./utilities/utils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, getChainId, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = parseInt(await getChainId());

  const signer = ethers.provider.getSigner(deployer);

  // 31337 is unit testing, 1337 is for coverage
  const isTestEnvironment = chainId === 31337 || chainId === 1337;

  dim("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  dim("           Whitelist - Deploy Script");
  dim("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");

  dim(`network: ${chainName(chainId)} (${isTestEnvironment ? "local" : "remote"})`);
  dim(`deployer: ${deployer}`);

  cyan("\nDeploying WhitelistSelector...");

  const linkData = chainLinkData(chainId);

  const whitelistDeployResult = await deploy("WhitelistSelector", {
    from: deployer,
    args: [linkData.vrfCoordinator, linkData.linkAddress, linkData.keyHash, linkData.fee],
    skipIfAlreadyDeployed: true,
  });

  displayResult("WhitelistSelector", whitelistDeployResult);

  const whitelistContract = await ethers.getContractAt("WhitelistSelector", whitelistDeployResult.address, signer);

  console.log(await whitelistContract.randomResult());
  console.log(await whitelistContract.previousWinnerSeed());

  const linkContract = await ethers.getContractAt("LinkTokenInterface", linkData.linkAddress);
  const linkBalance = await linkContract.balanceOf(whitelistDeployResult.address);

  if (linkBalance < linkData.fee) {
    const transaction = await linkContract.transfer(whitelistDeployResult.address, linkData.fee);
    console.log(transaction);
    const result = await transaction.wait(5);
    console.log(result);
  }

  green(`Done!`);
};

export default func;
func.tags = ["WL"];
