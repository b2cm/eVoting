# Evoting project

This project comes with the 3 main folders: client, goerli, zksync.

## Installation client
```sh
# Navigate to the client folder
$ cd client 
```

```sh
# Install the required dependencies
$ npm install 
```

```sh
# Start the react dev server
$ npm start 
```
## Installation Goerli
```sh
# Navigate to goerli folder
$ cd goerli 
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
# Deploy a smart contract
$ npx hardhat run <script> --network goerli
```
## Installation zksync
```sh
# Navigate to zksync folder
$ cd zksync 
```

```sh
# Install the required dependencies
$ yarn  
```

```sh
# Compile the smart contracts
$ yarn hardhat compile
```

```sh
# Deploy a smart contract
$ yarn hardhat deploy-zksync --script <script>
```

## E-voting 

# Steps to run 

yarn install

yarn lrs:build && yarn pallier:build && yarn elgammal:build

yarn db:start

cd packages\lrs && yarn build:typings 

yarn backend:dev
 
yarn frontend:dev


