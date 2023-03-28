import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Container,
    Box,
    Grid,
    Typography,
    CircularProgress,
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/de';

import MyCard from './MyCard';
import { useEth } from '../../../contexts/EthContext'
import { Contract, } from "zksync-web3";
import { VOTING_STATES, } from '../../../utils/constantes';
import Footer from '../../common/Footer';
import HomeHeader from './HomeHeader';
import HomeActions from './HomeActions';

var isBetween = require('dayjs/plugin/isBetween');
var isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
var isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);



function Home() {
    const [status, setStatus] = useState('Alle Statuen');
    const [waitingMessage, setWaitingMessage] = useState('Daten werden geladen');
    const { state,} = useEth();
    const [voteData, setVoteData] = useState([]);
    const [voteDataFilter, setVoteDataFilter] = useState([]);
    const { l2Contracts, signer, l2Provider, accounts, artifacts} = state;

    const compareNumbers = (a, b) => {
        const A = a.createAt;
        const B = b.createAt;
        // Descending order
        return B - A
    }

    useEffect(() => {
        const getContractData = async (contractAddr) => {
            try {
                
                const EVOTING_ABI = (artifacts[2]).abi;
                const contract = new Contract(contractAddr, EVOTING_ABI, l2Provider);
                //console.log('evoting', contract);
                let data = await contract.get_details();
                //console.log('data', data);
                const voteName = data._name;
                const voteDescription = data._description;
                const state = VOTING_STATES[(data._state)];
                const voteStartTime = (data._start_time).toNumber();
                const voteEndTime = (data._end_time).toNumber();
                const createdAt = (data._createdAt).toNumber();
                const voteID = data._voteID;
                const ballotPapers = data._ballot_papers;
                //const admin = await contract.admin();
                data = {
                    //admin,
                    voteID,
                    voteName, 
                    voteDescription, 
                    state,
                    createdAt, 
                    voteStartTime, 
                    voteEndTime,
                    ballotPapers,
                    contract
                };
                //console.log('vote data', data);
                return {contract, data};
                
            } catch (error) {
                console.error(error);
            }
        }


        const getDataFromAllContracts = async (factory) => {
            const addresses = await factory.get_votings();
            if (addresses.length === 0 ) {
                setWaitingMessage('Keine Daten gefunden')
            } else {
                const data = [];
                for (let i = 0; i < addresses.length; i++) {
                    const res = await getContractData(addresses[i]);
                    //console.log(`data ${i}:`, res.data)
                    data.push(res.data);
                   
                }

                const sortedData = data.sort((a, b) => compareNumbers(a, b));
                setVoteData(sortedData);
                setVoteDataFilter(sortedData);
            }
        }

        const functionsToRegister = (factory) => {
            setWaitingMessage('Daten werden aktualisiert');
            setVoteDataFilter([]);
            getDataFromAllContracts(factory);
        }

        const addEventListeners = async (factory) => {
            factory.on('VotingCreated', () => {
                functionsToRegister(factory);
            });

            const addresses = await factory.get_votings({type: 0});
            addresses.forEach(async address => {
                const res = await getContractData(address);
                res.contract.on('VotingUpdated', () => {
                    functionsToRegister(factory);
                 });
                 
                res.contract.on('VotingCanceled', () => {
                    functionsToRegister(factory);
                 });
                 /*
                res.contract.on('BallotsRemoved', async () => {
                    setVoteData([]);
                    setVoteDataFilter([]);
                    setWaitingMessage('Daten werden aktualisiert');
                    getDataFromAllContracts(factory);
                 });
                */

            });
        
        }

        const removeAllListeners = async (factory) => {
            factory.removeAllListeners('VotingCreated');
            const addresses = await factory.get_votings({type: 0});
            addresses.forEach(async address => {
                //console.log('home unmounted.');
                const res = await getContractData(address);
                res.contract.removeAllListeners('VotingUpdated');
                //res.contract.removeAllListeners('BallotsAdded');
                //res.contract.removeAllListeners('BallotsRemoved');
                res.contract.removeAllListeners('VotingCanceled');
            })
        }

        if (l2Contracts) {
            const factory = l2Contracts.FactoryEvoting;
            getDataFromAllContracts(factory);
            addEventListeners(factory);
            

            return () => {
                removeAllListeners(factory);
            }
        }

        
    }, [l2Contracts, l2Provider, artifacts]);


  return (
    <>
        <Container sx={{
        paddingTop: {xs: 2, sm: 2, md: 3, lg: 5, xl: 5}, 
        height: '85vh',
       // overflow: 'scroll'
        //border: 'solid 1px'
        }}>
        <HomeHeader />
        <HomeActions voteData={voteData} setVoteDataFilter={setVoteDataFilter} setWaitingMessage={setWaitingMessage} />
        
        {voteDataFilter.length > 0 && 
            <>
            
            <Grid 
            container 
            spacing={1} 
            columns={{xs: 12, sm: 12, md: 12, lg: 12, xl: 12}} 
            sx={{
                //zIndex: -5,
                height: {xs: '70%', sm: '70%', md: '75%', lg: '80%', xl: '85%'},
                overflow:'scroll',
                marginTop: 1,
                //border: 'solid 1px red'
            }}
             >
                {voteDataFilter.map((data, index) => {
                    const isEditable = data.state === VOTING_STATES[0] ? true : false;
                    return (
                        
                        <Grid key={index} item xs={12} sm={6} md={4} lg={4} xl={3} > 
                            <Link 
                                to={`/vote/cockpit/${data.voteID.slice(2)}`} 
                                state={{
                                    voteName: data.voteName,
                                    voteDescription: data.voteDescription,
                                    voteID: data.voteID,
                                    voteStartTime: data.voteStartTime,
                                    voteEndTime: data.voteEndTime,
                                    admin: 'alex',
                                    ballotPapers: data.ballotPapers,
                                    //contract: data.contract,
                                    isEditable, 
                                    state: data.state
                                    
                                }}
                                style={{textDecoration: 'none',}}
                            >
                                <MyCard 
                                    voteName={data.voteName} 
                                    voteDescription={data.voteDescription}
                                    state={data.state}
                                    createdAt={data.createdAt}
                                    voteStartTime={data.voteStartTime} 
                                    voteEndTime={data.voteEndTime} 
                                />
                            </Link>
                        
                    </Grid>
                    )
                })}
            </Grid>
            </>
        }
        
        {voteDataFilter.length === 0 &&
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10
            }} >
                <Typography variant='h4' sx={{
                    marginRight: 2,
                }}>
                    {waitingMessage}
                </Typography>
                {!waitingMessage.startsWith('Keine') && <CircularProgress size={30} disableShrink/>}
            </Box>
        }
    
    </Container>
    <Footer />
    </>
  )
}

export default Home