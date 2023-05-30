## E-voting 

# Steps to run 

yarn install

yarn lrs:build && yarn pallier:build && yarn elgammal:build

yarn db:start

cd packages/lrs && yarn build:typings 

yarn backend:dev
 
yarn frontend:dev


