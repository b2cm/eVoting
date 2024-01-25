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
import { BALLOT_TYPE1_ANSWERS } from '../../../utils/constantes';
import { actions, useEth } from '../../../contexts/EthContext';
import { Contract, utils } from 'zksync-web3';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { TransactionDialogBox } from '../../common/TransactionDialogBox';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';
import BallotIcon from '@mui/icons-material/Ballot';

export default function ControlOverview(props) {
    const { state, dispatch } = useEth();
    const { signer, artifacts, l2Provider, l2Contracts, paymaster } = state;
    const { voteID } = useParams();
    const { ballots, answersPerBallot, handleCloseOverview, credentials } = props;
    const [openDialog, setOpenDialog] = useState(false);
    const [waitingMessage, setWaitingMessage] = useState(['']);
    const [progress, setProgress] = useState(0);
    const [buffer, setBuffer] = useState(10);
    const navigate = useNavigate();

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('sm'));

    const getEvoting = async() => {
        const factory = l2Contracts.FactoryEvoting;
        const EVOTING_ABI = artifacts[2].abi;
        const voteContractAddr = await factory.get_voting('0x' + voteID);
        const evoting = new Contract(voteContractAddr, EVOTING_ABI, l2Provider);
        return evoting;
    }

    const getBallots = async (evoting) => {
        try {    
            const _ballots = [];
            const ballots = await evoting.get_ballot_papers();

            for (let i = 0; i < ballots.length; i++) {
                const ballot = {
                    ballotType: ballots[i].ballotType,
                    name: ballots[i].name,
                    information: ballots[i].information,
                    title: ballots[i].title,
                    candidates: ballots[i].candidates
                }
                _ballots.push(ballot);
            }
            
            return _ballots;
        } catch (error) {
            console.error(error);
        }
    }
    const pubKey = 826344133539501080037625820098479085508537651913848278597202485940166690727324676173937291847739931947912432722315708246773953702332257472293365813101604446355691625539637562922084273126849071642242125849438954933195671079141669460n
    const PrivKey= 462021571530507360931184193766058479594756767639082008652922236215650087933355898970098733653785079156445011276272783409846981484571287163809133213117546398165149966819670062929856838311038630980769066332193852360520143402466596867n
    const MNEMONIC_GOERLI = "7b6a99cbccae2acf1cb5d737a5908c21cbbc5e913e239fbdf8b8f9e393c4843d";
    const api_key = '5603dfe25e514e7198477778e8c05c7b';
    const web3 = new ethers.providers.InfuraProvider('goerli', api_key);
    const wallet = new ethers.Wallet(MNEMONIC_GOERLI, web3);

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

    const postData = async ( data = {}) => {
        // Default options are marked with *
        const url = "http://127.0.0.1:3100/CreateSession";
        const response = await fetch(url, {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          credentials: "same-origin", // include, *same-origin, omit
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          redirect: "follow", // manual, *follow, error
          referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: JSON.stringify(data), // body data type must match "Content-Type" header
        });
        return response.json(); // parses JSON response into native JavaScript objects
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
        const ballots = await getBallots(evoting);
        //console.log('ballots', ballots);
        const group = await l2Contracts.Register.getLRSGroup();
        console.log('group', group);
        const ring = group.map((n) => BigInteger(BigInt(n)));
        const pub = BigInt(credentials.pk);
        const sk = BigInt(credentials.sk);
        console.log('pub', pub.toString());
        const finalBallots = [];
        let finalVotes = [];

        setProgress(40);
        setBuffer(70);
       for (let i = 0; i < answersPerBallot.length; i++) {
            const options = answersPerBallot[i].options;
            finalBallots.push({id: answersPerBallot[i].ballotID, data: []});
           if (Array.isArray(options)) {
                //console.log('typeOfOptions', answersPerBallot[i]);
                const candidates = ballots[answersPerBallot[i].ballotID].candidates;
                //console.log('candidates', candidates);
                let votesType2 = [];
                let votesType1 = [];
                for (let j = 0; j < options.length; j++) {
                    //console.log('op', options);
                    for (const [key, value] of Object.entries(options[j].answers)) {
                        if (value) {
                         
                            const [c, proof] = createMemberShipZKP(key, BALLOT_TYPE1_ANSWERS, pub);
                            //console.log('cipher1:', c2);
                            //console.log('proof:', proof2);
                            //const verify2 = verifyMembershipZkp(c2, proof2, BALLOT_TYPE1_ANSWERS, pub);
                            //console.log('verify zkp membership answers', verify2);
                            const cipher = ethers.utils.hexlify(c);
                            const inputs = computeZKPInputs(c, proof, BALLOT_TYPE1_ANSWERS, pub);
                            //console.log('inputs', inputs);
                            //console.log('cipher2', cipher);
                            const pk = ethers.utils.hexlify(pub);
                            //console.log('pk', pk);
                            
                            try {
                                
                                //const gasPrice = await l2Provider.getGasPrice();
                                const gasPrice = await web3.getGasPrice();
                                //console.log('gas price:', ethers.utils.formatEther(gasPrice));
                                /*
                                const gasLimit = await contract.estimateGas.verifyTx(
                                    cipher,
                                    inputs.proof,
                                    inputs.isProofONegativ,
                                    inputs.as,
                                    inputs.ias,
                                    inputs.gmk,
                                    inputs.e,
                                    pk
                                );
                                //console.log('gas limit', ethers.utils.formatEther(gasLimit));
                                
                                const result = await contract.callStatic.verifyTx(
                                    cipher,
                                    inputs.proof,
                                    inputs.isProofONegativ,
                                    inputs.as,
                                    inputs.ias,
                                    inputs.gmk,
                                    inputs.e,
                                    pk,
                                    
                                    {
                                        // Provide gas params manually
                                        //maxFeePerGas: gasPrice,
                                        //maxPriorityFeePerGas: gasPrice,
                                        gasLimit,
                                        //gasPrice
                                    }
                                    
                                );
        
                                console.log(`verify zkp of correct encryption at index ${i}: ${j}`, result);
                                */
                                
                            } catch (error) {
                                console.error(error);
                            }
                            
                            const signature = signData(
                                ring, 
                                new KeyPair({ value0: BigInteger(pub), value1: BigInteger(sk) }),
                                c
                                );

                            console.log('signature', signature);
                            console.log('Array------------------------------------------------');
                            //console.log('verify signature', verifySignature(c2, signature, ring));
                            const p = proof.map(pr => pr.map(e => e.toString()));
                            console.log('ppp', p);
                            const y0 = signature.y0.toString();
                            const s = signature.s.toString();
                            const cc =  signature.c.map(e => e.toString());
                          
                            const b = {
                                sessionId,
                                cipherText: c,
                                proof: {
                                    p1: p[0], //proof[0].map(p => p.toString()),
                                    p2: p[1], // proof[1].map(p => p.toString()),
                                    p3: p[2], //proof[2].map(p => p.toString()),
                                },
                                signature: { y0, s, c: cc },
                                groupId: 'osiuhdfs',
                                token: 'siugdsio384ß0384'
                            };
    
                            
                            votesType2 = [...votesType2, b];
                            console.log('bbb', votesType2)

                        }
                    }                    
                }

                const ballotWithIndex = {
                    index: answersPerBallot[i].ballotID,
                    ballot: [ ...votesType2 ]
                };

                console.log('votessss', ballotWithIndex);
                /*
                finalVotes = [...finalVotes, ballotWithIndex];
                
                const gas = await evoting.connect(signer).estimateGas.vote([ ballotWithIndex ]);
                console.log('gas',  ethers.utils.formatEther(gas));
                const tx = await evoting.connect(signer).vote([ ballotWithIndex ]);
                console.log('tx', tx);
                const receipt = await tx.wait();
                console.log('receipt', receipt);
                */
            }
            else {
                console.log('------------------------------------------------');
                //console.log('not array', options);
                for (const [key, value] of Object.entries(options)) {
                    if (value) {
                        const [c, proof] = createMemberShipZKP(key, BALLOT_TYPE1_ANSWERS, pub);
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

                        console.log(`verify zkp of correct encryption at index ${i}`, result);
                        
                       
                        const signature = signData(
                            ring, 
                            new KeyPair({ value0: BigInteger(pub), value1: BigInteger(sk) }),
                            c
                        );
                        const p = proof.map(pr => pr.map(e => e.toString()));
                        console.log('ppp', signature);
                        const y0 = signature.y0.toString();
                        const s = signature.s.toString();
                        const cc =  signature.c.map(e => e.toString());
                      
                        const b = {
                            sessionId,
                            cipherText: c,
                            proof: {
                                p1: p[0], //proof[0].map(p => p.toString()),
                                p2: p[1], // proof[1].map(p => p.toString()),
                                p3: p[2], //proof[2].map(p => p.toString()),
                            },
                            signature: { y0, s, c: cc },
                            groupId: 'test group',
                            token: 'siugdsio384ß0384'
                        };

                        const ballotWithIndex = {
                            index: answersPerBallot[i].ballotID,
                            ballot: [ b ]
                        };
                        /*
                        console.log('b with index', ballotWithIndex);
                       
                        const gas = await evoting.connect(signer).estimateGas.vote([ ballotWithIndex ]);
                        console.log('gas',  ethers.utils.formatEther(gas));

                        const tx = await evoting.connect(signer).vote([ ballotWithIndex ]);
                        console.log('tx', tx);
                        const receipt = await tx.wait();
                        console.log('receipt', receipt);
                        */
                        finalVotes = [...finalVotes, ballotWithIndex];
                    }
                }
                
            }
       }
       setProgress(70);
        setBuffer(100);
       console.log('final ballots', finalVotes);

       try {
        const paymasterParams = utils.getPaymasterParams(paymaster, {
            type: 'General',
            innerInput: new Uint8Array(),
            });
    
            const gasPrice = await l2Provider.getGasPrice();
            console.log('gas ', gasPrice);
    
        const gasLimit = await evoting.connect(signer).estimateGas.vote(
            finalVotes,
            
            {
                customData: {
                    gasPerPubData: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
                    paymasterParams
                },
            }
            
        );
        const txHandle = await evoting.connect(signer).vote(
            finalVotes,
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
        console.log('tx', txHandle);
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

    useEffect(() => {
        const votes = [];
        for (let i = 0; i < answersPerBallot.length; i++){
            if(Array.isArray(answersPerBallot[i].options)){
                console.log(answersPerBallot[i]);
            }
        } 
    });

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [open, setOpen] = useState([]);

    useEffect(() => {
        if (ballots) {
            setOpen(new Array(ballots.length).fill(false));
        }
      }, [ballots]);

    const handleClick = (index) => {
        console.log(index);
        setOpen(prev => {
            for(let i = 0; i < prev.length; i++) {
                if (i === index) {
                    prev[index] = !prev[index];
                }else {
                    prev[i] = false;
                }
            }
            
            console.log('prev', prev)
            return [...prev];
        });
        setSelectedIndex(index);
      };

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


