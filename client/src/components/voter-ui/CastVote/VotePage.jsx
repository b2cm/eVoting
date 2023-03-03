import React, { useState, useEffect, useLayoutEffect} from 'react';
import {useParams} from "react-router-dom";
import WalletButton from '../../common/WalletButton';
import { useEth, actions  } from '../../../contexts/EthContext';
import { Contract, Provider, Web3Provider, utils } from "zksync-web3";
import { poseidon } from '@big-whale-labs/poseidon';
import { createHash } from 'crypto';
import {
    Container,
    Box,
    Button,
    Input,
    IconButton,
    InputAdornment,
    Typography,
} from '@mui/material';
import {
    grey,
    teal,
} from '@mui/material/colors';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Login from '../Login/Login';


const EVOTING_ABI = require('../../../contracts/Evoting2.sol/Evoting.json').abi;

export default function VotePage(props) {
    const { state, dispatch } = useEth();
    const { contracts, l1Contracts, l2Contracts, signer, chainId } = state;
    const { voteID, } = useParams();
    const [isVoteIDCorrect, setIsVoteIDCorrect] = useState(false);
    const [showWaitingMessage, setShowWaitingMessage] = useState(true);
    const [voteContract, setVoteContract] = useState(null);

    const l2Provider = new Provider('https://zksync2-testnet.zksync.dev');

    const inputBackgroundColor = grey[50]; // #FAFAFA
    const inputLabelBackgroundColor = '#CCCCCC';
    const inputBackgroundColorHover = '#F7F7F7';
    const textColor = '#000000DB'; // rgba(0,0,0,0.86)
    const borderColor = '#0000009E';

    const VOTING_STATES = ['IN VORBEREITUNG', 'AKTUELL IN ABSTIMMUNG', 'ABGESCHLOSSEN', 'ABGEBROCHEN'];
    const waitingMessage = 'Die Daten werden geladen. \n Wir bitten Sie um etwas Geduld.'


    const handleClickConnectWallet = async () => {
       //const accounts = await state.web3.eth.requestAccounts()
       const accounts = await window.ethereum.request({ method: 'eth_requestAccounts'});
       const signer = (new Web3Provider(window.ethereum)).getSigner();
       console.log('signer2', await signer.getAddress());
        dispatch({
            type: actions.init,
            data: { 
              accounts,
              signer,
             }
          });
    }


    

    useLayoutEffect(() => {
        dispatch({
            type: actions.init,
            data: {
                isUI: true,
            }
        });
    }, []);

   useEffect(() => {

    const getFactoryContract = () => {
        const FACTORY_ADDRESS = '0x68906255AE72F1e7a56B35EcfFf33D0E89C3f77B';
        const FACTORY_ABI = (require('../../../contracts/FactoryEvoting2.json')).abi;
        const factory = new Contract(FACTORY_ADDRESS, FACTORY_ABI, l2Provider);
        return factory;
    }

    const getContractData = async (contractAddr) => {
        try {
            const contract = new Contract(contractAddr, EVOTING_ABI, l2Provider);
            const voteName = await contract.name();
            const voteDescription = await contract.description();
            const state = VOTING_STATES[(await contract.votingState())];
            const voteStartTime = (await contract.start_time()).toNumber();
            const voteEndTime = (await contract.end_time()).toNumber();
            const createAt = (await contract.createAt()).toNumber();
            const data = {
                voteName, 
                voteDescription, 
                state,
                createAt, 
                voteStartTime, 
                voteEndTime
            };
            return { 
                contract,
                data, 
            };
            
        } catch (error) {
            console.error(error);
        }
    }

    const getData = async () => {
       try {
        const zeroAddr = '0x0000000000000000000000000000000000000000'
        const factory = getFactoryContract();
        const votingAddr = await factory.get_voting('0x' + voteID);
        console.log('vote address', votingAddr);
        if (votingAddr !== zeroAddr) {
            const result = await getContractData(votingAddr);
            console.log(result);
            setVoteContract(result.contract);
            setIsVoteIDCorrect(true);
            setShowWaitingMessage(false);
        }else {
            setIsVoteIDCorrect(false);
            setShowWaitingMessage(false);
        }
            
       } catch (error) {
        console.log('error', error);
       }
        
    }

    if (voteID.length !== 64) {
        setShowWaitingMessage(false);
        setIsVoteIDCorrect(false);
    } else {
       getData();
    }
    
   }, [voteID]);

   const newButton = (value, onClick) => {
    return (
        <Button
        variant='contained'
        size='large'
        onClick={onClick}
        sx={{
            width: 1,
            fontSize: 12,
            mt: 10,
            backgroundColor: teal[500],
            ":hover": {
                backgroundColor: teal[700]
            }
        }}
    >
    {value}
    </Button>
    );
   } 
    

  return (
    <Container sx={{
        display: 'flex',
        justifyContent: 'center',
        //alignItems: 'center',
        marginTop: 10,
        height: '85%',
        overflow: 'scroll'
        }}>
        <Box
         sx={{
            width: '100%',
        }}
        >
            {!chainId ? 
                <Typography variant='h4' textAlign='center' sx={{
                    mt:10,
                }}>
                Please wait.
                </Typography> :
                <>
                {isVoteIDCorrect ? 
                    <>
                     {!signer && newButton('Wallet verbinden', handleClickConnectWallet) }
     
                     {signer && <Login /> }
                    </> :
                    <>
                        {showWaitingMessage ?
                            <Typography variant='h4' textAlign='center'
                                sx={{
                                    mt: 10,
                                }}
                            >
                            {waitingMessage}
                            </Typography> :
                            <Typography variant='h4' textAlign='center' 
                                sx={{
                                    mt: 10,
                                }}
                            >
                                Der Wahl-ID ist falsch. 
                            </Typography>
                        }
                    </> 
                }
                </> 
                
            }
               
        </Box> 
       
    </Container>
  )
}
