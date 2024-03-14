# Evoting



## The Protocol
The eVoting protocol consist of the following six phases

### The registration phase
During the registration phase, voters provide their email and password. Upon registra.on, each voter is assigned a unique ID (derived from their email and password combina.on) and a key pair for linkable ring signatures (LRS). The voter's hashed ID is securely stored on the blockchain. This hashed ID serves as a reference for verifying the identity of the voter during subsequent phases of the voting process.

### The pre-election phase
During the pre-election phase, the election parties, typically a minimum of three, participate in an election session. Together, they collaboratively generate encryption keys required for secure communication and data handling during the voting process. Additionally, these parties work together to allocate tokens to registered voters and set submission limits.
The tokens allocated to voters are used to authenticate their identity and authorize their participation in the voting process. Each voter is assigned a certain number of tokens, and these tokens are linked to their hashed IDs, ensuring a secure and verifiable connection between the voter and their allocated resources.

Submission limits are established to regulate the number of times a voter can cast their vote. These limits serve to prevent fraudulent activities such as double voting or excessive voting, thereby enhancing the integrity of the election process. By setting these limits collaboratively, the election parties ensure fairness and transparency in the allocation of voting resources.

###	Authentication and login phase
During the authentication phase, voters present their unique ID and key pair for linkable ring signatures (LRS). The smart contract overseeing the authentication process then utilizes a Zero-Knowledge Proof (ZKP) known as a proof of membership to verify that the voter is included in the list of registered voters without disclosing their identity.

This proof of membership protocol allows the smart contract to validate the voter's eligibility to participate in the election without revealing any additional information about the voter's identity. By employing cryptographic techniques such as ZKPs, the authentication process maintains the privacy and confidentiality of the voter's personal information while ensuring the integrity of the election.

###	Voting phase
During the voting phase, voters request a token for each vote they wish to cast. After receiving tokens, voters select their choices for each question on the ballot. The chosen votes are then combined into a single encrypted ballot, containing the encrypted vote, encrypted token, and a signature. A smart contract verifies the correctness of the encryption on the ballot before storing it on the blockchain. This process ensures the security and integrity of the voting process, as all votes are securely recorded and stored on the blockchain for transparency and verification purposes.

### Post-election phase
During the post-election phase, all election parties engage in the filtering process to maintain vote integrity and prevent tampering. This involves downloading encrypted ballots, adding dummy ballots for anonymity, grouping them, and selecting the highest index vote for each voter. Each party independently conducts this process.

Once completed, the results from each party are compared. If a predefined number of parties agree on the same outcome, the filtering result is considered valid and stored on the blockchain. To ensure the correctness of the shuffling process, a smart contract verifies the zero-knowledge proof (zk proof) of correct shuffling.

This phase emphasizes transparency, security, and consensus among election parties, culminating in the secure storage of filtered results on the blockchain, thereby ensuring the integrity and trustworthiness of the election process.

### Tallying phase
During the tallying phase, at least three election parties collaborate to decrypt the encrypted votes. Each party decrypts a portion of the votes using their private keys. They then exchange zero-knowledge proofs of correct partial decryption to verify the integrity and accuracy of the decryption process. Once verified, the parties collectively perform the final decryption of the votes. The concatenated bit strings are analyzed to count the number of votes cast for each question. This process determines the outcome of the election. This process ensures the accurate tabulation of votes while maintaining the privacy and security of the election.

## Project's structure 
This project comes with the 3 main folders: client, blockchain and packages.

### The blockchain's folder
This folder contains the smart contract code(create and manage voting, verify the zero knowledge proofs)
We use the blockchains zksync and Ethereum. zksync is a zero-knowledge compatible Layer 2 blockchain that allows execution of smart contracts. However, since zksync was not fully compatible with Ethereum at the time of working on the project, we decided to deploy the smart contract for verifying ZKPs directly on Ethereum.

### The client's folder
This folder contains the code for the user interface. Admin can create and manage votes, and voters can register, log in and vote.

### The packages's folder
This folder contains a standalone eVoting protocol, which is not fully connected to the blockchain yet. It contains several subfolder which have a particular role:
1. backend
2. DB
3. elgammal
4. frontend
5. lrs
6. paillier
7. tallying_server

## Set up the application

### L1 smart contracts
```sh
# From the root navigate to goerli folder
$ cd blockchain/goerli 
```

```sh
# Install the required dependencies
$ yarn  
```

```sh
# Compile the smart contracts
$ npx hardhat compile
```

```sh
# Deploy the ZKPs smart contracts
$ npx hardhat run <script> --network goerli
```
### L2 smart contracts
```sh
# From the root navigate to zksync folder
$ cd blockchain/zksync 
```

```sh
# Install the required depedencies
$ yarn  
```

```sh
# Compile the smart contracts
$ yarn hardhat compile
```

```sh
# Deploy the factory, register and paymaster smart contracts
$ yarn hardhat deploy-zksync --script <script>
```

### The user interface
```sh
# From the root navigate to the client folder
$ cd client 
```

```sh
# Install the required depedencies
$ npm install 
```

```sh
# Start the react dev server
$ npm start 
```

### The packages foder
```sh
# From the root navigate to the packages folder
$ cd packages
```

```sh
# Install the depedencies
$ yarn install
```

```sh
# Build the project
$ yarn lrs:build && yarn pallier:build && yarn elgammal:build
$ cd packages/lrs && yarn build:typings 
```

```sh
# Start the services
$ yarn db:start
$ yarn backend:dev
$ yarn frontend:dev
```

```sh
# Start the tallying server
$ cd tallying_server
$ chmod +x ./run.sh
$ ./run.sh 
``` 


## Run the application
1. Perform the voters registration
2. Perform the pre-election phase 
    - The admin creates a new vote (uses the UI from the client folder)
    - At least 3 election parties connect to the system and generation tokens for voters (Use the UI from packages/frontend)
3. Voters log in (UI from client folder)
4. Voters vote (UI from client folder)
5. Perform the filtering (Use the UI from packages/frontend)
6. Perform the decryption (at least 3 election parties) & tally

You will find some videos in the videos directory that explicitly explain the application's workflow.