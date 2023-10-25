const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
const { getContractFactory } = require("@nomiclabs/hardhat-ethers/types");
const {initForking} = require('./helpers/forking');

async function readBytecode() {
  const fs = require("fs");
  let byteCode = fs.readFileSync("./huff/contract.hex").toString();
  byteCode = "0x" + byteCode.slice(0, byteCode.length);
  return byteCode;
};

describe("Hello World", function () {

  before(async () => {

    [admin] = await ethers.getSigners();

    bytecode = await readBytecode();
    const {deployBytecode} = require('./helpers/bytecode');
    HelloWorld = await deployBytecode(bytecode);
  });

  beforeEach(async () => {
    helloWorld = (await HelloWorld.deploy());
  });

  describe("Functionality", function () {

    it("default return", async () => {
      let data = await helloWorld.callStatic("0x");
      let abiCoder = new ethers.utils.AbiCoder;
      let greeting = abiCoder.decode(["string"], data);
      expect(greeting).to.deep.equal(["Hello, world!"]);
    });

    it("could set new greeting", async () => {
      await helloWorld.call("0x48656c6c6f2c20736f6c696469747921");
      let data = await helloWorld.callStatic("0x");
      let abiCoder = new ethers.utils.AbiCoder;
      let greeting = abiCoder.decode(["string"], data);
      expect(greeting).to.deep.equal(["Hello, solidity!"]);
    });

    it("reverts if string too big", async () => {
      await expect(helloWorld.call("0x484848484848484848484848484848484848484848484848484848484848484848"))
        .to.be.reverted;
    });


  });
});