import { expect } from "chai";
import { Wallet, Provider, Contract } from "zksync-web3";
import * as hre from "hardhat";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import data from '../data/voterData.json';
//console.log((data[0]));
const RICH_WALLET_PK = "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110";

async function deployVerifier(deployer: Deployer): Promise<Contract> {
  const artifact = await deployer.loadArtifact("VerifierMembershipZKP");
  return await deployer.deploy(artifact, []);
}

describe("Verifier zkp correct encryption", function () {
  it("Should verify the proof of correct encryption", async function () {
    const provider = Provider.getDefaultProvider();

    const wallet = new Wallet(RICH_WALLET_PK, provider);
    const deployer = new Deployer(hre, wallet);

    const verifier = await deployVerifier(deployer);
    //console.log(verifier);
    const bn = await verifier.BN([data[0].lrs.sk]);
    console.log(bn);
    /*
    data.slice(0, 1).forEach(async (element) => {
        const bn = await verifier.BN([element.lrs.sk]);
        console.log(bn);
    });
    */
/*
    expect(await verifier.greet()).to.eq("Hi");

    const setGreetingTx = await verifier.setGreeting("Hola, mundo!");
    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await verifier.greet()).to.equal("Hola, mundo!");
    */
  });
});

