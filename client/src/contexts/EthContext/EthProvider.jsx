import React, { useReducer, useCallback, useEffect } from "react";
import { Box,} from '@mui/material';
import * as  ethers from 'ethers';
import { RelayProvider} from '@opengsn/provider';
import { Contract, Provider } from "zksync-web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(
    async (artifacts, chainId) => {

      const initGoerliChain = async () => {
        console.log('Goerli chain');
        let l1Contracts = {};
            const paymasterAddress = '0x7C10d29cfc9951958d8ffF6d9D9c9697A146bf70';//'0x7e4123407707516bD7a3aFa4E3ebCeacfcbBb107';
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
            artifacts.forEach(artifact => {
              const { abi, contractName } = artifact;
              let contract;
              if (contractName === 'Verifier') {
                try {
                  contract = new ethers.Contract(VerifierAddr, abi, web3);
                l1Contracts = {...l1Contracts, [contractName]: contract};
                } catch (error) {
                  console.log('error', error);
                }
                
              };
            });
  
            dispatch({
              type: actions.init,
              data: { artifacts, web3, l1Contracts, provider, signer, chainId: '0x5' }
            });
      }

      const initZKSyncChain = async () => {
        console.log('ZkSync chain');
        let l2Contracts;
            const FACTORY_ADDRESS = '0xb34B2a89887CdF591Af55A1110a766F222B838d8';
            const REGISTER_ADDRESS = '0xBb3185076500033a92b61Dd6Cee2F75a77679514';
            const PAYMASTER_ADDRESS = '0xEB7B801A52e9110329229d9785523c3Af7C0e896';
            const l2Provider = new Provider('https://zksync2-testnet.zksync.dev');
            
            artifacts.forEach(artifact => {
              const { contractName } = artifact;
              if (contractName === 'FactoryEvoting') {
                const abi = artifact.abi;
                const contract = new Contract(FACTORY_ADDRESS, abi, l2Provider);
                l2Contracts = {...l2Contracts, [contractName]: contract};
              }
              if (contractName === 'Register') {
                const abi = artifact.abi;
                const contract = new Contract(REGISTER_ADDRESS, abi, l2Provider);
                l2Contracts = {...l2Contracts, [contractName]: contract};
              }
            });
            //console.log('l2Contracts', l2Contracts);
            dispatch({
              type: actions.init,
              data: {  artifacts, l2Contracts, l2Provider, chainId: '0x118', paymaster: PAYMASTER_ADDRESS }
            });
      }


      window.onload = (event) => {
        const chainId = window.ethereum.chainId;
      
        if (artifacts) {
          try {
            if (chainId === '0x118') { // zksync network
              initZKSyncChain()
            } else if(chainId === '0x5') { // Goerli network
              initGoerliChain()
            }
          } catch (error) {
            console.log('Error', error);
          }
        }
      }

      if (chainId) {
        try {
          if (chainId === '0x118') { // zksync network
            initZKSyncChain()
          } else if(chainId === '0x5') { // Goerli network
            initGoerliChain()
          }
        } catch (error) {
          console.log('Error', error);
        }
      }
      
    }, []);

    
  useEffect(() => {
    const tryInit = async () => {
      try { 
        const artifact1 = require("../../contracts/goerli/artifacts/contracts/Verifier.sol/Verifier.json");
        const artifact2 = require('../../contracts/zksync/artifacts-zk/contracts/FactoryEvoting.sol/FactoryEvoting.json');
        const artifact3 = require('../../contracts/zksync/artifacts-zk/contracts/Evoting.sol/Evoting.json');
        const artifact4 = require('../../contracts/zksync/artifacts-zk/contracts/Register.sol/Register.json');
        const artifacts = [ artifact1, artifact2, artifact3, artifact4 ];
      
        init(artifacts);
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
        init(state.artifacts, e);
      }
      
    };

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state]);


  return (
    <Box sx={{ height: '100vh'}}>
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
