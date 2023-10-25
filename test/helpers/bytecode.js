const { ethers } = require("hardhat");

exports.deployBytecode = async function(bytecode) {
    if (bytecode.slice(0,2) != "0x") {
        throw new Error("Bytecode should start with 0x");
    }
    if (bytecode.length % 2 == 1) {
        throw new Error("Invalid bytecodd: odd number of hex symbols");
    }
    
    let [admin] = await ethers.getSigners();

    return {
        contractBytecode: bytecode,
        deployBytecode: bytecode,
        signer: admin,
        connect: connect,
        deploy: deploy,
    }
}

async function deploy() {
    let futureAddress = ethers.utils.getContractAddress({
        from: this.signer.address,
        nonce: await this.signer.getTransactionCount(),
    })

    let txResult = await this.signer.sendTransaction({
        data: this.deployBytecode
      });
    let receipt = await txResult.wait();
    // console.log("Gas used for deploy:", receipt.gasUsed.toString());

    return {
        address: futureAddress,
        txResult: txResult,
        signer: this.signer,
        connect: connect,
        call: call,
        callStatic: callStatic,
    }
}

async function callStatic(calldata, value = 0) {
      let result = await ethers.provider.call({
        from: this.signer.address,
        to: this.address,
        data: calldata,
        value: value,
      })
      return result;
}

async function call(calldata, value = 0) {
    let tx = await this.signer.sendTransaction({
        to: this.address,
        data: calldata,
        value: value,
      });
    let receipt = await tx.wait();
    // console.log("Gas used", receipt.gasUsed.toString())
    return tx;
}

function connect(signer) {
    let cloned = Object.assign({}, this);
    cloned.signer = signer;
    return cloned;
}