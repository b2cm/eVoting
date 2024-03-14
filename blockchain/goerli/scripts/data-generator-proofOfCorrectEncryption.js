const fs = require('fs');
const { generatePair } = require('../cryptography/lrs/build/commonjs');
const { createMemberShipZKP, verifyMembershipZkp, computeZKPInputs } = require('../cryptography/pallier/build/commonjs');
const  ethers = require('ethers');

const rawVoterData = fs.readFileSync('data/voter-data.json');
const voterData = JSON.parse(rawVoterData);

const newVoterData = voterData.map(data => {
    const pair = generatePair();
    const pub = BigInt(pair.publicKey);
    const messages = ['JA', 'NEIN', 'ENTHALTUNG'];
    const randomIndex = Math.floor(Math.random() * 3);
    console.log('message', messages[randomIndex]);
    const [c, proof] = createMemberShipZKP(messages[randomIndex], messages, pub);
    const cipher = ethers.utils.hexlify(c);
    const sk = ethers.utils.hexlify(BigInt(pair.privateKey));
    const pk = ethers.utils.hexlify(BigInt(pair.publicKey));
    const inputs = computeZKPInputs(c, proof, messages, pub);
    const res = verifyMembershipZkp(c, proof, messages, pub);
    console.log('res', res);
   
    return {
        ...data,
        lrs: {
            sk,
            pk
        },
        inputsProofCorrectEncr: {
            plain: messages[randomIndex],
            cipher,
            inputs
            
        }
    }
});

console.log('new data', newVoterData);
fs.writeFileSync('data/voterData.json', JSON.stringify(newVoterData));


