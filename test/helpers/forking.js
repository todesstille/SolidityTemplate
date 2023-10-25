require('dotenv').config();

exports.initForking = function(ntw, blockNumber) {
    switch (ntw) {
        case "bsc":
            return initBsc(blockNumber);
        default:
            throw new Error("Network not implemented");
    }
}

function initBsc(blockNumber) {
    return {
        url: process.env.BSC_URL,
        blockNumber: blockNumber,
        chainId: 56,
        start: async function () {
          await startForking(this.url, this.blockNumber, this.chainId);
        },
        getToken: async function(tokenName, address, amount) {
          await receiveToken("bsc", tokenName, address, amount);
        }
    }
}

async function startForking(url, blockNumber, chainId) {
    await hre.network.provider.request({
        method: "hardhat_reset",
        params: [
          {
            forking: {
              jsonRpcUrl: url,
              blockNumber: blockNumber,
              chainId: chainId,
            },
          },
        ],
      });
}

async function receiveToken(networkName, tokenName, address, amount) {
  let [tokenAddress, vault] = getImpersonateParameters(networkName, tokenName);
  let signer = await ethers.getImpersonatedSigner(vault);
  await hre.network.provider.send("hardhat_setBalance", [vault, "0xFFFFFFFFFFFFFFFF"]);
  let token = await ethers.getContractAt("IERC20", tokenAddress);
  await token.connect(signer).transfer(address, amount);
}

function getImpersonateParameters(networkName, tokenName) {
  if (networkName.toLowerCase() == "bsc") {
    switch (tokenName.toLowerCase()) {
      case "wbnb":
        return(["0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", "0x36696169C63e42cd08ce11f5deeBbCeBae652050"])
      case "usdt":
        return(["0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", "0xf977814e90da44bfa03b6295a0616a897441acec"]);
      case "usdc":
        return(["0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", "0xf89d7b9c864f589bbF53a82105107622B35EaA40"]);
      case "dai":
        return(["0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", "0xF977814e90dA44bFA03b6295A0616a897441aceC"]);
    }
  }
  throw new Error("Not implemented for this token and this network");
}