import React, {
    useEffect, useMemo,
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
    
} from '@mui/material';
import BallotType1 from '../../common/ballot/BallotType1';
import BallotType2 from '../../common/ballot/BallotType2';
import { computeZKPInputs, createMemberShipZKP, verifyMembershipZkp } from '../../../cryptography/pallier';
import { generatePair, KeyPair, signData, verifySignature  } from '../../../cryptography/lrs';
import { 
    ELECTION_IN_PREPARATION_COLOR,
    INPUT_LABEL_BACKGROUND_COLOR,
    SUCCESS_COLOR,
    SUCCESS_COLOR_HOVER
 } from '../../../utils/colors';
import { BALLOT_TYPE1_ANSWERS } from '../../../utils/constantes';
import { useEth } from '../../../contexts/EthContext';
import { Contract } from 'zksync-web3';
import { useParams } from 'react-router-dom';
import * as ethers from 'ethers';

export default function ControlOverview(props) {
    const { state } = useEth();
    const { artifacts, l2Provider, l2Contracts } = state;
    const { voteID } = useParams();
    const { ballots, answersPerBallot, handleCloseOverview } = props;
    console.log('answers', answersPerBallot);

    const getBallots = async () => {
        try {
            const factory = l2Contracts.FactoryEvoting;
            const EVOTING_ABI = artifacts[2].abi;
            const voteContractAddr = await factory.get_voting('0x' + voteID);
            const contract = new Contract(voteContractAddr, EVOTING_ABI, l2Provider);
            
            const _ballots = [];
            const ballots = await contract.get_ballot_papers();

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
    const contract = useMemo(() => {
        if (artifacts) {
            const api_key = '5603dfe25e514e7198477778e8c05c7b';
            const web3 = ethers.getDefaultProvider(`https://goerli.infura.io/v3/${api_key}`);
            const VERIFIER_MEMBERSHIP_ZKP_ADDRESS = '0xBb00F6fB79D4922D95b4ad53a6358f297CC0435E';
            const abi = artifacts[4].abi;
            const contract = new ethers.Contract(VERIFIER_MEMBERSHIP_ZKP_ADDRESS, abi, web3);
            console.log('contract', contract);
            return contract;
        }
    }, [artifacts]);

    const handleSentVote = async () => {
        const ballots = await getBallots();
        //console.log('ballots', ballots);
        const group = await l2Contracts.Register.getLRSGroup();
        const ring = group.map((n) => BigInteger(n));
        //console.log('group', group);
        const pair = generatePair();
       // console.log('pair', pair.publicKey.valueOf());
        const pub = BigInt(pubKey);
        console.log('pub', pub.toString(16));
        const finalBallots = [];
       for (let i = 0; i < answersPerBallot.length; i++) {
            const options = answersPerBallot[i].options;
            finalBallots.push({id: answersPerBallot[i].ballotID, vote: []});
           if (Array.isArray(options)) {
                //console.log('typeOfOptions', answersPerBallot[i]);
                const candidates = ballots[answersPerBallot[i].ballotID].candidates;
                //console.log('candidates', candidates);
                for (let j = 0; j < options.length; j++) {
                   // console.log('candidate', options[j].candidate);
                    const [c, proof] = createMemberShipZKP(options[j].candidate, candidates, pub);
                    //const verify = verifyMembershipZkp(c, proof, candidates, pub);
                    //console.log('verify zkp membership candidate', verify);
                    

                    for (const [key, value] of Object.entries(options[j].answers)) {
                        if (value) {
                            const [c2, proof2] = createMemberShipZKP(key, BALLOT_TYPE1_ANSWERS, pub);
                            //const verify2 = verifyMembershipZkp(c2, proof2, BALLOT_TYPE1_ANSWERS, pub);
                            //console.log('verify zkp membership answers', verify2);
                            const cipher = ethers.utils.hexlify(c2);
                            const inputs = computeZKPInputs(c2, proof2, BALLOT_TYPE1_ANSWERS, pub);
                            //console.log('inputs', inputs);
                            //console.log('cipher', cipher);
                            const result = await contract.callStatic.verifyMembershipZKP(
                                cipher,
                                inputs.proof,
                                inputs.isProofONegativ,
                                inputs.as,
                                inputs.ias,
                                inputs.gmk,
                                inputs.e,
                                ethers.utils.hexlify(pub)
                            );
    
                            console.log(`verify membership zkp at index ${i}: ${j}`, result);
            
                            const signature = signData(
                                ring, 
                                new KeyPair({ value0: BigInteger(pubKey), value1: BigInteger(PrivKey) }),
                                c2
                                );
                            //console.log('signature', signature);
                            console.log('------------------------------------------------');
                            //console.log('verify signature', verifySignature(c2, signature, ring));
                           
                            finalBallots[i] = ({
                                id: answersPerBallot[i].ballotID,
                                vote: [
                                    ...finalBallots[i].vote,
                                    {
                                    candidate: options[j].candidate,
                                    vote: ethers.utils.hexlify(c2), // Ciphertext
                                    proof: proof,
                                    proof2: proof2,
                                    signature: signature,
                                    voterID: 'TODO',
                                    counter: 'TODO',
                                }]
                            });
                        }
                    }
                    
                }
            }
            else {
                console.log('------------------------------------------------');
                //console.log('not array', options);
                for (const [key, value] of Object.entries(options)) {
                    if (value) {
                        const [c, proof] = createMemberShipZKP(key, BALLOT_TYPE1_ANSWERS, pub);
                        //const verify = verifyMembershipZkp(c, proof, BALLOT_TYPE1_ANSWERS, pub);
                        //console.log('verify zkp membership answers', verify);
                        const cipher = ethers.utils.hexlify(c);

                        const inputs = computeZKPInputs(c, proof, BALLOT_TYPE1_ANSWERS, pub);
                        //console.log('inputs', inputs);
                        //console.log('cipher', cipher);

                        const result = await contract.callStatic.verifyMembershipZKP(
                            cipher,
                            inputs.proof,
                            inputs.isProofONegativ,
                            inputs.as,
                            inputs.ias,
                            inputs.gmk,
                            inputs.e,
                            ethers.utils.hexlify(pub)
                        );

                        console.log(`verify membership zkp at index ${i}`, result);
                       
                        const signature = signData(
                            ring, 
                            new KeyPair({ value0: BigInteger(pubKey), value1: BigInteger(PrivKey) }),
                            c
                        );

                       

                        finalBallots[i] = ({
                            id: answersPerBallot[i].ballotID,
                            vote: [
                                ...finalBallots[i].vote,
                                {
                                vote: ethers.utils.hexlify(c), // Ciphertext
                                proof: proof,
                                signature: signature,
                                voterID: 'TODO',
                                counter: 'TODO',
                            }]
                        });
                    }
                }
                
            }
       }
       console.log('final ballots', finalBallots);
    }

    

  return (
    <Container sx={{
        height: '74vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', 
        //overflowY: 'auto',
        //border: 'solid',
        borderWidth: '1px',
        borderColor: INPUT_LABEL_BACKGROUND_COLOR,
        paddingBottom: 2,
        paddingTop: 2,
        marginTop: 0,
        }}>
            <Typography variant='h4' component='p'>Kontrollübersicht</Typography>
            <List style={{maxHeight: '100vh', overflow: 'scroll', width: '80%', marginTop: 5}} >
            {ballots.map((ballot, index) => {
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
                })
            }
            </List>
            <Tooltip>
                <Button variant='contained' size='large' fullWidth
                onClick={handleSentVote}
                sx={{
                    width: '80%',
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
    </Container>
  )

}


