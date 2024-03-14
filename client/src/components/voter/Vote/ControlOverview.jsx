import React, {
    useEffect, useMemo, useState,
}
 from 'react';
 import BigInteger from "big-integer";
import {
    Container,
    Box,
    Card,
    CardContent,
    Typography,
    Tooltip,
    Button,
    CardActions,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,

    
} from '@mui/material';
import BallotType1 from '../../common/ballot/BallotType1';
import BallotType2 from '../../common/ballot/BallotType2';
import { computeZKPInputs, createMemberShipZKP, verifyMembershipZkp } from '../../../cryptography/pallier';
import { generatePair, KeyPair, signData, verifySignature  } from '../../../cryptography/lrs';
import { 
    ELECTION_IN_PREPARATION_COLOR,
    INPUT_LABEL_BACKGROUND_COLOR,
    SUCCESS_COLOR,
    SUCCESS_COLOR_HOVER,
    ICON_COLOR
 } from '../../../utils/colors';
import { BALLOT_TYPE1_ANSWERS, BACKEND_URL } from '../../../utils/constantes';
import { actions, useEth } from '../../../contexts/EthContext';
import { Contract, utils } from 'zksync-web3';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { TransactionDialogBox } from '../../common/TransactionDialogBox';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';
import BallotIcon from '@mui/icons-material/Ballot';
import { poseidon } from '@big-whale-labs/poseidon';
import axios from 'axios';
import env from 'react-dotenv';



export default function ControlOverview(props) {
    const { state, dispatch } = useEth();
    const { signer, artifacts, l2Provider, l2Contracts, paymaster } = state;
    const { voteID } = useParams();
    const { ballots, answersPerBallot, handleCloseOverview, credentials } = props;
    const [openDialog, setOpenDialog] = useState(false);
    const [waitingMessage, setWaitingMessage] = useState(['']);
    const [progress, setProgress] = useState(0);
    const [buffer, setBuffer] = useState(10);
    const [tokens, setTokens]  = useState(null);
    const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
    const [groups, setGroups] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [open, setOpen] = useState([]);
    const navigate = useNavigate();

    const sessionId = '488f3db7-4e0c-4352-9f0a-6bdb9b21e68b';

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('sm'));

    /** generate all possibble 12 bit combinations of binary fpr eg 000000000001
     * @returns {{bigint}} all the possibilites
     */
    const messagePossibilities = () => {
        const possibilities = [];
        for (let i = 0; i < 4096; i++) {
        const binary = i.toString(2);
        const binaryString = binary.padStart(12, "0");
        possibilities.push(BigInt("0b" + binaryString));
        }
        return possibilities;
    };

    const getEvoting = async() => {
        const factory = l2Contracts.FactoryEvoting;
        const EVOTING_ABI = artifacts[2].abi;
        const voteContractAddr = await factory.get_voting('0x' + voteID);
        const evoting = new Contract(voteContractAddr, EVOTING_ABI, l2Provider);
        return evoting;
    }
    
    const api_key = '';// Pass your provider api key here
    const web3 = new ethers.providers.InfuraProvider('goerli', api_key);
    console.log('env', env);

    const contract = useMemo(() => {
        if (artifacts) {
            const VERIFIER_ZKP_ADDRESS = '0xc17049cdf90de161f523A95563f1bA3A1654B6Fa';
            const abi = artifacts[4].abi;
            const contract = new ethers.Contract(VERIFIER_ZKP_ADDRESS, abi, web3);
           
            return contract;
        }
    }, [artifacts]);

    const handleCloseDialog = () => {
        //navigate(-1);
        setOpenDialog(false);     
    }

    const handleLogout = () => {
        dispatch( {
            type: actions.init,
            data: { isVoterAuthenticated: false, signer: null }
        });
        navigate('/logout');
    }

    // This function encode the voter's choices
    const encodeAnswers = (answers) => {
        const encoding = [];
        answers.forEach((answer, index) => {
            const options = answer.options;
            if (options.JA) {
                encoding[index] = '010';
              } else if (options.NEIN) {
                encoding[index] = '100';
              } else if (options.ENTHALTUNG) {
                encoding[index] = '001';
              }
        } );
        const encodingBigInt = BigInt('0b' + encoding.reduce((acc, current) => acc + current, ''));
        return encodingBigInt;
    }


    const sendVote = async (evoting, vote) => {
        try {
            const paymasterParams = utils.getPaymasterParams(paymaster, {
                type: 'General',
                innerInput: new Uint8Array(),
                });
        
                const gasPrice = await l2Provider.getGasPrice();
                console.log('gas ', gasPrice);
        
            const gasLimit = await evoting.connect(signer).estimateGas.vote(
                vote,
                {
                    customData: {
                        gasPerPubData: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
                        paymasterParams
                    },
                }
            );
            const txHandle = await evoting.connect(signer).vote(
                vote,
                {
                    // Provide gas params manually
                    maxFeePerGas: gasPrice,
                    maxPriorityFeePerGas: gasPrice,
                    gasLimit,
                
                    // paymaster info
                    customData: {
                      paymasterParams,
                      gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
                     },
                     
                  } 
                );
            const receipt = await txHandle.wait();
            const events = receipt.events;
            console.log('receipt', receipt);
            events.forEach(e => {
                if (e.event === 'VoteReceived') {
                    console.log('event', e);
                   // setWaitingMessage(`voter-ID: ${voterID} \n ` );
                    setProgress(100);
                    const message0 = 'Ihre Stimme wurde erfolgreich gespeichert';
                    setWaitingMessage([message0]);
                }
            });
           } catch (error) {
            setProgress(0);
            setBuffer(10)
            setWaitingMessage([error.code, error.message]);
           }
    }


    const handleSentVote = async () => {
        setOpenDialog(true);
        setWaitingMessage(['Ihre Stimme wird gespeichert'])
        setProgress(10);
        setBuffer(40);
        
       const register = l2Contracts.Register;
       const sessionId = await register.sessionID();
       console.log('Session id', sessionId)
       const evoting = await getEvoting();
        
        const pub = BigInt('0x' + credentials.pk);
        const sk = BigInt('0x' + credentials.sk);

        const possibilities = messagePossibilities();
        const encodedAnswers = encodeAnswers(answersPerBallot);

        setProgress(40);
        setBuffer(70);

        const [c, proof] = createMemberShipZKP(encodedAnswers, possibilities, pub);
        //console.log('cipher:', c);
        console.log('proof:', proof[0]);
        //const verify = verifyMembershipZkp(c, proof, BALLOT_TYPE1_ANSWERS, pub);
        //console.log('verify zkp membership answers', verify);
        const cipher = ethers.utils.hexlify(c);
        const inputs = computeZKPInputs(c, proof, BALLOT_TYPE1_ANSWERS, pub);
                        
        const result = await contract.callStatic.verifyTx(
            cipher,
            inputs.proof,
            inputs.isProofONegativ,
            inputs.as,
            inputs.ias,
            inputs.gmk,
            inputs.e,
            ethers.utils.hexlify(pub)
        );

        console.log(`verify zkp of correct encryption at index`, result);

        //find our group
        const g = Object.entries(groups).find(([, keys]) =>
        keys.some((k) => BigInteger(k).compare(pub) == 0)
        );

        if (!g) {
        return;
        }

        const signature = signData(
            g[1].map((n) => BigInteger(n)),
            new KeyPair({ value0: BigInteger(pub), value1: BigInteger(sk) }),
            c
        );
        const p = proof.map(pr => pr.map(e => e.toString()));
        console.log('ppp', signature);
        const y0 = signature.y0.toString();
        const s = signature.s.toString();
        const cc =  signature.c.map(e => e.toString());
                      
        const ballot = {
            sessionId,
            cipherText: c,
            proof: {
                p1: p[0], //proof[0].map(p => p.toString()),
                p2: p[1], // proof[1].map(p => p.toString()),
                p3: p[2], //proof[2].map(p => p.toString()),
            },
            signature: { y0, s, c: cc },
            groupId: g[0],
            token: tokens[currentTokenIndex]
        };
        setCurrentTokenIndex(val => val + 1);
        setProgress(70);
        setBuffer(100);
        console.log('final ballots', ballot);
        //sendVote(evoting, vote);
       
    }

    const handleClick = (index) => {
        setOpen(prev => {
            for(let i = 0; i < prev.length; i++) {
                if (i === index) {
                    prev[index] = !prev[index];
                }else {
                    prev[i] = false;
                }
            }
            return [...prev];
        });
        setSelectedIndex(index);
      };


    useEffect(() => {
        if (credentials && !tokens && !groups) {
            const pubKey = credentials.pk.toString(16);

            const getGroups = async () => {
                let { data } = await axios.get(BACKEND_URL + '/Vote/Voter');
                for (const id in data) {
                    data[id] = data[id].map((s) => BigInt("0x" + s));  
                }
                setGroups(data);
                console.log('groups', data);
            }

            const getTokens = async() => {
                const tokens = await axios.post(BACKEND_URL + '/Vote/Voter/' + pubKey, {
                    sessionId
                });
                setTokens(tokens.data.tokens);
                console.log('tokens', tokens.data.tokens);
            }

            getGroups();
            getTokens()
        }
    }, [credentials]);

    useEffect(() => {
        if (ballots) {
            setOpen(new Array(ballots.length).fill(false));
        }
      }, [ballots]);


    const renderBallotAsButton = (index, ballot) => {
        return (
            <>
            <ListItemButton 
            
                key={index}
                selected={selectedIndex === index && open[index]}
                onClick={() => handleClick(index)
                    //handleClickBallot(index)
                }
                sx={{
                    border: 'solid 1px #CCCCCC',
                    borderRadius: '0px',
                    marginBottom: 1,
                }}>
                <ListItemIcon style={{ minWidth: '30px' }} >
                    <BallotIcon sx={{ width: 20, height: 20, color: ICON_COLOR }} />
                </ListItemIcon>
                <ListItemText
                    disableTypography sx={{
                        marginLeft: 0,
                        width: 1,
                        overflowX: 'hidden',
                        fontSize: 12,
                        fontWeight: 530,
                        color: 'grey'
                    }} >
                    {ballot.name === '' ? 'Unbenannt' : ballot.name}
                </ListItemText>
            </ListItemButton>
            <Collapse in={open[index]} timeout='auto' unmountOnExit sx={{
                marginBottom: 2
            }}>
                
                <Card variant='outlined' sx={{ 
                    //width: 1 
                    }}>
                <CardContent sx={{ maxHeight: 500, overflow: 'scroll',}} >
                    
                    {ballot.ballotType === 1 &&
                        <BallotType1 answersPerBallot={answersPerBallot[index].options} restructure={true} disabled={true} selectedBallot={ballot} />
                    }
                    {ballot.ballotType === 2 &&
                        <BallotType2 answersPerBallot={answersPerBallot[index].options} restructure={true} disabled={true} selectedBallot={ballot} />
                    }
                </CardContent>
                <CardActions>
                    <Button variant='contained' 
                        onClick={() => handleCloseOverview({selectedIndex: index, open: open})}
                        sx={{
                            fontSize: 10,
                            //fontWeight: 'bold',
                            //backgroundColor: ELECTION_IN_PREPARATION_COLOR
                        }}
                    >
                        Antwort bearbeiten
                    </Button>
                </CardActions>
            </Card>
            </Collapse>
            </>
        )
    }
/*
    const func = () => {
        return (
            <ListItem key={index} >
                <Card variant='outlined' sx={{ width: 1 }}>
                <CardContent sx={{ maxHeight: 500, overflow: 'scroll',}} >
                    <Typography variant='h5' gutterBottom marginBottom={1} >{ballot.name}</Typography>
                    
                    {ballot.ballotType === 1 &&
                        <BallotType1 answersPerBallot={answersPerBallot[index].options} restructure={true} disabled={true} selectedBallot={ballot} />
                    }
                    {ballot.ballotType === 2 &&
                        <BallotType2 answersPerBallot={answersPerBallot[index].options} restructure={true} disabled={true} selectedBallot={ballot} />
                    }
                </CardContent>
                <CardActions>
                    <Button variant='contained' 
                        onClick={() => handleCloseOverview(index)}
                        sx={{
                            fontSize: 10,
                            //fontWeight: 'bold',
                            //backgroundColor: ELECTION_IN_PREPARATION_COLOR
                        }}
                    >
                        Antwort bearbeiten
                    </Button>
                </CardActions>
            </Card>
            </ListItem>
        )
    }
*/

    

  return (
    <Box sx={{
        height: '74vh',
        display: 'flex',
        flexDirection: 'column',
        //alignItems: 'center', 
        //overflowY: 'auto',
        //border: 'solid',
        borderWidth: '1px',
        borderColor: INPUT_LABEL_BACKGROUND_COLOR,
        paddingBottom: 2,
        paddingTop: 2,
        marginTop: 0,
        }}>
            <TransactionDialogBox  handleLogout={handleLogout} handleCloseOverview={handleCloseOverview} openDialog={openDialog} handleCloseDialog={handleCloseDialog} waitingMessage={waitingMessage} progress={progress} buffer={buffer} />
            <Typography variant='h4' component='p' align='center'>Kontrollübersicht</Typography>
            <List style={{
                //maxHeight: '100vh', 
                //height: '60vh',
                overflow: 'scroll', 
                width: matches ? '100%' :'80%', 
                marginTop: 5}} >
            {ballots.map((ballot, index) => renderBallotAsButton(index, ballot))}
            </List>
            <Tooltip>
                <Button 
                    variant='contained' 
                    size='large' 
                    fullWidth
                    marginTop={3}
                    onClick={handleSentVote}
                sx={{
                    width: matches ? '100%' : '80%',
                    marginTop: 4,
                    fontSize: 12,
                    //fontWeight: 'bold',
                    backgroundColor: SUCCESS_COLOR,
                    ":hover": {
                        backgroundColor: SUCCESS_COLOR_HOVER
                    }
                }}
                >
                    Verbindlich abstimmen
                </Button>
            </Tooltip>
            
    </Box>
  )

}


