const poseidon = require('@big-whale-labs/poseidon').poseidon;
const createHash = require('crypto').createHash;
const emails = require('email-generator');
const passwords = require('generate-password');
const fs = require('fs');

const generateData = () => {
    const data = [];

    for (let i = 0; i < 1024; i++) {
        const sha512 = createHash('sha512');
        const email = emails.generateEmail();
        const password = passwords.generate({
            length: Math.random() * 100,
            numbers: true,
        });
      
        const voterID = sha512.update(email + password).digest('hex');
        const hashedID = (poseidon(['0x' + voterID])).toString();
       
        const voterData = {
            email,
            password,
            voterID,
            hashedID
        }
        data.push(voterData)
    }

    fs.writeFileSync('data/voter-data.json', JSON.stringify(data), 
        {
            encoding: "utf8",
            flag: "a+",
            //mode: 0o666
        }
    );
}

generateData();