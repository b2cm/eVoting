import React, { useReducer, useCallback, useEffect, useRef } from "react";
import { Box,} from '@mui/material';
import * as  ethers from 'ethers';
import { RelayProvider} from '@opengsn/provider';
import { Contract, Provider } from "zksync-web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";
import detectEthereumProvider from "@metamask/detect-provider";
import MetaMaskOnboarding from '@metamask/onboarding';

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const provider = useRef();
  const onboarding = useRef();

  const VERIFIER_MEMBERSHIP_ZKP_ADDRESS = '0xBb00F6fB79D4922D95b4ad53a6358f297CC0435E';

  const init = useCallback(
    async (artifacts) => {

      const initGoerliChain = async () => {
        console.log('Goerli chain');
        let l1Contracts = {};
            const paymasterAddress = '0x7e4123407707516bD7a3aFa4E3ebCeacfcbBb107'//'0x7C10d29cfc9951958d8ffF6d9D9c9697A146bf70';//'0x7e4123407707516bD7a3aFa4E3ebCeacfcbBb107';
            const config = {
              paymasterAddress,
              loggerConfiguration: {
                logLevel: 'debug',
                //loggerUrl: 'logger.opengsn.org'
              },
              //performDryRunViewRelayCall: false,
            };
            const provider = await RelayProvider.newProvider({
              provider: window.ethereum,
              config
            }).init();
  
            const web3 = new ethers.providers.Web3Provider(provider);//new Web3(provider);
            const signer = web3.getSigner();

            // Only for when deploying with hardhat
            const VerifierAddr = '0xa7Cf1CA0b79B717C25E3285a4C92190F53E7FCcB' //'0x131f79d89949E9dD77c7a1d856eF455c8F548511' //'0xf000CE7D8AE067Ec85c2dFc88Be09EE237692749' //'0x7601c69C15edA95CC52665F83DbccD591faa8355'//'0x5d9813735cB07f18adE6f148b545e86A8f03A44C'//'0x589CDC4026692F65191b94259c48478a631EC1e7';
            const createContract = (name, addr, abi) => {
              try {
                const contract = new ethers.Contract(addr, abi, web3);
                l1Contracts = {...l1Contracts, [name]: contract};
              } catch (error) {
                console.error(error);
              }
            }
            artifacts.forEach(artifact => {
              const { abi, contractName } = artifact;
              let contract;
              if (contractName === 'Verifier') {
                /*
                try {
                  contract = new ethers.Contract(VerifierAddr, abi, web3);
                l1Contracts = {...l1Contracts, [contractName]: contract};
                } catch (error) {
                  console.log('error', error);
                }
                */
               createContract(contractName, VerifierAddr, abi);
                
              };
            });
  
            dispatch({
              type: actions.init,
              data: { artifacts, web3, ethProvider: provider.current, l1Contracts, provider, signer, chainId: '0x5' }
            });
      }

      const initZKSyncChain = async () => {
        console.log('ZkSync chain');
        let l2Contracts;
            const FACTORY_ADDRESS = '0x3516FdFB9997A225901212cF090d339f0804739D' //'0x54C26460cfEf6ed20e5931Ffd19e6E0B889EDa99' //'0xb34B2a89887CdF591Af55A1110a766F222B838d8';
            const REGISTER_ADDRESS =  '0x8CA5cBAB6859D77514F4BA22d54201619757D7c8' //'0xD3c666482aA63dFa1ffC776554CA0282521Fb464' //'0x6075fB141a7FAc62e91286F1AA67aC3c4ae4b73f' //'0x8b3C5Af9f90734AF6625D7266BDD03E2BD7B659c';
            const PAYMASTER_ADDRESS = '0xEB7B801A52e9110329229d9785523c3Af7C0e896';
            const VERIFIER_MEMBERSHIP_ZKP_ADDRESS = '0x9841A1904A8Fd56Dd9124eF46aEA731fa82c4711';
            const l2Provider = new Provider('https://zksync2-testnet.zksync.dev');
            l2Provider.pollingInterval = 10000000;
            console.log('l2 provider', l2Provider);
            
            artifacts.forEach(artifact => {
              const { contractName, abi } = artifact;
              if (contractName === 'FactoryEvoting') {
                //const abi = artifact.abi;
                const contract = new Contract(FACTORY_ADDRESS, abi, l2Provider);
                l2Contracts = {...l2Contracts, [contractName]: contract};
              }
              if (contractName === 'Register') {
                //const abi = artifact.abi;
                const contract = new Contract(REGISTER_ADDRESS, abi, l2Provider);
                l2Contracts = {...l2Contracts, [contractName]: contract};
              }
              if (contractName === 'VerifierMembershipZKP') {
                //const abi = artifact.abi;
                const contract = new Contract(VERIFIER_MEMBERSHIP_ZKP_ADDRESS, abi, l2Provider);
                l2Contracts = {...l2Contracts, [contractName]: contract};
              }
            });
            //console.log('l2Contracts', l2Contracts);
            dispatch({
              type: actions.init,
              data: {  artifacts, l2Contracts, l2Provider, ethProvider: provider.current, chainId: '0x118', paymaster: PAYMASTER_ADDRESS }
            });
      }

      const initHardhat = async () => {
        console.log('Hardhat chain');
        const web3provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");

        let l1Contracts = {};
            const paymasterAddress = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707';
            const config = {
              paymasterAddress,
              loggerConfiguration: {
                logLevel: 'debug',
                //loggerUrl: 'logger.opengsn.org'
              },
              //performDryRunViewRelayCall: false,
            };
            const provider = await RelayProvider.newProvider({
              provider:  window.ethereum,
              config
            }).init();
  
            const web3 = new ethers.providers.Web3Provider(provider);
            const signer = web3.getSigner();

            // Only for when deploying with hardhat
            const VerifierAddr = '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c';
            const createContract = (name, addr, abi) => {
              try {
                const contract = new ethers.Contract(addr, abi, web3);
                l1Contracts = {...l1Contracts, [name]: contract};
              } catch (error) {
                console.error(error);
              }
            }
            artifacts.forEach(artifact => {
              const { abi, contractName } = artifact;
              if (contractName === 'Verifier') {
               createContract(contractName, VerifierAddr, abi); 
              };
            });
  
            dispatch({
              type: actions.init,
              data: { artifacts, web3, ethProvider: provider.current, l1Contracts, provider, signer, chainId: '0x5' }
            });
      }

      try {
        provider.current = await detectEthereumProvider();
        if (provider.current) {
          console.log('provider', provider.current)
          const chainId = await provider.current.request({
            method: 'eth_chainId'
          });
          
          if (chainId === '0x118') { // zksync network
            initZKSyncChain()
          }
          if(chainId === '0x5') { // Goerli network
            initGoerliChain()
          }
          if (chainId ==='0x7a69') { // hardhat
            initHardhat();
          }
        }
      } catch (error) {
        console.log('Error', error);
      }
      
    }, []);
/*
    useEffect(() => {
      const browser = MetaMaskOnboarding._detectBrowser();
      window.alert(`browser:${browser}`);
      const getProvider = async () => { 
        provider.current = await detectEthereumProvider();
      }
      if (MetaMaskOnboarding.isMetaMaskInstalled()) {
        getProvider(); 
        if (provider.current && onboarding.current) {
          console.log('current provider', provider.current)
          onboarding.current.stopOnboarding();
        }
        dispatch({
          type: actions.init,
          data: {  ethProvider: provider.current }
        });
      } else {
        if (!onboarding.current && browser !== null) {
          onboarding.current = new MetaMaskOnboarding();
          onboarding.current.startOnboarding();
        }
        
      }
    }, []);

   */ 
  useEffect(() => {

    const tryInit = async () => {
      try { 
        const artifact1 = require("../../contracts/goerli/artifacts/contracts/Verifier.sol/Verifier.json");
        const artifact2 = require('../../contracts/zksync/artifacts-zk/contracts/FactoryEvoting.sol/FactoryEvoting.json');
        const artifact3 = require('../../contracts/zksync/artifacts-zk/contracts/Evoting.sol/Evoting.json');
        const artifact4 = require('../../contracts/zksync/artifacts-zk/contracts/Register.sol/Register.json');
        const artifact5 = require('../../contracts/goerli/artifacts/contracts/VerifierMembershipZKP.sol/VerifierMembershipZKP.json');
        const artifacts = [ artifact1, artifact2, artifact3, artifact4, artifact5 ];
        init(artifacts);
       // const browsers = MetaMaskOnboarding._detectBrowser();
       // window.alert(`browser:${browsers}`);
      } catch (err) {
        console.error(err);
      }
    };
    
  
    tryInit();
  }, [init]);


  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = (e) => {
      //console.log('event', e);
      if (typeof(e) === 'object') { // account changed
        dispatch({
          type: actions.init,
          data: { accounts: e }
        })
      } else if (typeof(e) === 'string') { // chain changed
        //console.log('state', state)
        //window.alert(`new chain id:${e}`);
        init(state.artifacts);
      }
      
    };

    if (provider.current) {
      events.forEach(e => provider.current.on(e, handleChange));
      return () => {
        events.forEach(e => provider.current.removeListener(e, handleChange));
      };
    }
    
  }, [init, state,]);


  return (
    <Box>
       <EthContext.Provider value={{
      state,
      dispatch,
    }}>
      {children}
    </EthContext.Provider>
    </Box>
   
  );
}

export default EthProvider;
