import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Container,
    Box,
    Button,
    FormControl,
    MenuItem,
    Select,
    Grid,
    Typography,
    CircularProgress,
} from '@mui/material';
import {
    teal,
} from '@mui/material/colors'; 

import MyDatePicker from '../../common/MyDatePicker';
import SearchField from '../../common/SearchField';
import MyCard from './MyCard';
import { useEth, actions } from '../../../contexts/EthContext'
import { Contract, } from "zksync-web3";
import { VOTING_STATES, } from '../../../utils/constantes';
import { TEXTCOLOR } from '../../../utils/colors';
import Footer from '../../common/Footer';




function Home() {
    const [status, setStatus] = useState('Alle Statuen');
    const [voteState, setVoteState] = useState([]);
    const [voteStart, setVoteStart] = useState(null);
    const [voteEnd, setVoteEnd] = useState(null);
    const [waitingMessage, setWaitingMessage] = useState('Daten werden geladen');
    const { state, dispatch} = useEth();
    const [voteData, setVoteData] = useState([]);
    const [voteDataFilter, setVoteDataFilter] = useState([]);
    const prevRoute = useLocation().pathname;

    const { l2Contracts, signer, l2Provider, accounts, artifacts} = state;


    const handleChange = async(event) => {
        const value = event.target.value;    
        setStatus(value);
        if (value === 'Alle Statuen') {
            setVoteDataFilter(voteData);
        } else {
            if (voteData.length>0) {
                const newData = voteData.filter(elem => elem.state.toLowerCase() === value.toLowerCase());
                newData.sort((a, b) => compareNumbers(a, b));
                setVoteDataFilter(newData);
            }
            
        }
    }


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
                const voteName = await contract.name();
                const voteDescription = await contract.description();
                const state = VOTING_STATES[(await contract.get_state())];
                const voteStartTime = (await contract.start_time()).toNumber();
                const voteEndTime = (await contract.end_time()).toNumber();
                const createAt = (await contract.createAt()).toNumber();
                const voteID = await contract.voteID();
                //const ballotPapers = await contract.ballot_papers(0, );
                //const admin = await contract.admin();
                const data = {
                    //admin,
                    voteID,
                    voteName, 
                    voteDescription, 
                    state,
                    createAt, 
                    voteStartTime, 
                    voteEndTime,
                    //ballotPapers,
                };
                //console.log('vote data', data);
                return {contract, data};
                
            } catch (error) {
                console.error(error);
            }
        }


        const getDataFromAllContracts = async (factory) => {
            const addresses = await factory.get_votings({type: 0});
            if (addresses.length === 0 ) {
                setWaitingMessage('Keine Daten gefunden')
            } else {
                const data = [];
                for (let i = 0; i < addresses.length; i++) {
                    const res = await getContractData(addresses[i]);
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
        paddingTop: 5, 
        height: '83vh',
        overflow: 'scroll'
        }}>
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                //border: 'solid 1px',
                //justifyContent: 'space-between'
                textAlign: 'center',
            }}
        >
            <Button variant='contained'
                size='large'
                sx={{
                    width: 200,
                    fontSize:12,
                    backgroundColor: teal[500],
                    ":hover": {
                        backgroundColor: teal[700]
                    }
                }}>
                <Link to={'/vote/create'} 
                    state={{ prevRoute }}
                    style={{textDecoration: 'none', color: 'white'}}>
                    Neue Wahl Erstellen
                 </Link>
            </Button>
            
            <Box sx={{
                flexGrow: 1, //5/6,
               // width: 3/4,
                display: 'flex',
                //border: 'solid 1px green',
                justifyContent: 'center',
            }}>
                <Typography style={{ color: TEXTCOLOR, fontSize: 20, }}>
                    Meine Wahlen
                </Typography>
            </Box>

            <Box width={200} sx={{
                //border: 'solid 1px'
            }}>

            </Box>
        </Box>
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,

        }}>
            <FormControl sx={{
                width: 200,
            }}>
                
                <Select
                    size='small'
                    labelId='select-label'
                    value={status}
                    //label='Status'
                    onChange={handleChange}
                >
                    <MenuItem value={'Alle Statuen'}>Alle Statuen</MenuItem>
                    <MenuItem value={'In Vorbereitung'}>In Vorbereitung</MenuItem>
                    <MenuItem value={'Aktuell in Abstimmung'}>Aktuell in Abstimmung</MenuItem>
                    <MenuItem value={'Abgeschlossen'}>Abgeschlossen</MenuItem>
                    <MenuItem value={'Abgebrochen'}>Abgrebrochen</MenuItem>

                </Select>
            </FormControl>
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                textAlign: 'center'
            }}
            >
                <p style={{ paddingTop: 20, paddingLeft:10, paddingRight: 10}}></p>
                <MyDatePicker label='Erstellt am:' value={voteStart} setValue={setVoteStart}/>
                <p style={{ paddingTop: 20, paddingLeft:10, paddingRight: 10}}></p>
                <MyDatePicker label='bis' value={voteEnd} setValue={setVoteEnd} />
            </Box>
            
            <SearchField />
        </Box>
        
        {voteDataFilter.length > 0 && 
            <Grid container paddingTop={5} spacing={4} columns={{xs: 12, sm:12, md: 12, lg:12}} overflow='scroll' >
                {voteDataFilter.map((data, index) => {
                    return (
                        
                        <Grid key={index} item xs={6} sm={4} md={4} lg={4} > 
                            <Link to={`/vote/cockpit/${data.voteID.slice(2)}`} 
                                state={{
                                    prevRoute
                                }}
                                style={{textDecoration: 'none',}}>
                                <MyCard 
                                    index={index}
                                    //onClick={handleClickCard}
                                    voteName={data.voteName} 
                                    voteDescription={data.voteDescription}
                                    state={data.state}
                                    createAt={data.createAt}
                                    voteStartTime={data.voteStartTime} 
                                    voteEndTime={data.voteEndTime} 
                                />
                            </Link>
                        
                    </Grid>
                    )
                })}
            </Grid>
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
    <Footer isActive={false} />
    </>
  )
}

export default Home