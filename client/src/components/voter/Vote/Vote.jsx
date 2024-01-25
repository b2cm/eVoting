import React, { useEffect, useState } from 'react';
import {
    CircularProgress,
    Container,
    Typography,
    Box,
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Card,
    CardContent,
    Divider,
    Tooltip,
    IconButton,
    Button,

} from '@mui/material';
import BallotIcon from '@mui/icons-material/Ballot';
import { useParams, useLocation } from 'react-router-dom';
import { useEth } from '../../../contexts/EthContext';
import { getElectionStateColor, getVoteDetails } from '../../../utils/utils';
import { Contract } from 'zksync-web3';
import dayjs from 'dayjs';
import { VOTING_STATES } from '../../../utils/constantes';
import { BORDER_COLOR, ELECTION_IN_PREPARATION_COLOR, ICON_COLOR, INPUT_LABEL_BACKGROUND_COLOR } from '../../../utils/colors';
import BallotType1 from '../../common/ballot/BallotType1';
import BallotType2 from '../../common/ballot/BallotType2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchField from '../../common/SearchField';
import Footer from '../../common/Footer';
import ControlOverview from './ControlOverview';
import axios from 'axios';
import { poseidon } from '@big-whale-labs/poseidon';
import { ethers } from 'ethers';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';



export default function Vote(props) {
    const [voteDetails, setVoteDetails] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [answersPerBallot, setAnswersPerBallot] = useState(null);
    const [newVoting, setNewVoting] = useState(false);
    const [overview, setOverview] = useState(false);
    const { state } = useEth();
    const { l2Contracts, artifacts, l2Provider, isVoterAuthenticated } = state;
    //const { isVoterAuthenticated } = props;
    const { voteID } = useParams();
    const [searchedBallots, setSearchedBallots] = useState(voteDetails);
    const [searchValue, setSearchValue] = useState('');
    const location = useLocation();
    const data = location.state;
    //console.log('data', isVoterAuthenticated);
    //const credentials = data.credentials;

    //const matches = useMediaQuery('(min-width:600px)');
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('sm'));
    console.log('match', matches);

    useEffect(() => {
        setSearchedBallots(voteDetails);
    }, [voteDetails]);
/*
    const handleSearchVotesByName = (event) => {
        setSearchValue(event.target.value);
        const searchedVotes = [];
        for (let i = 0; i < voteData.length; i++) {
            if (voteData[i].voteName.toLowerCase().startsWith((event.target.value).toLowerCase())) {
                searchedVotes.push(voteData[i]);
            }
        };
        if (searchedVotes.length === 0) {
            //setWaitingMessage('Keine Wahlen gefunden');
        }
       // setVoteDataFilter([...searchedVotes]);
        
    }
*/

    const nextBallot = () => {
        //const currentBallot = voteDetails.ballots[selectedIndex];
        setSelectedIndex(selectedIndex => selectedIndex + 1);
       //console.log('index', selectedIndex);
        
    }

    const previousBallot = () => {
        setSelectedIndex(selectedIndex => selectedIndex - 1);
    }

    

    const handleNewVotingPhase = () => {
        setOverview(false);
        setNewVoting(true);
    }

    const setAnswersObjectFormat = () => {
        const ballots = voteDetails.ballots;
            const answersPerBallotIndex = [];
            const answers = {
                'JA': false,
                'NEIN': false,
                'ENTHALTUNG': false,
            }
            for (let i = 0; i < ballots.length; i++) {
                if (ballots[i].ballotType === 1) {
                    answersPerBallotIndex.push({
                        ballotID: i,
                        options: Object.assign({}, answers)
                    });
                } else if (ballots[i].ballotType === 2) {
                    const options = []
                    for (let j = 0; j < ballots[i].candidates.length; j++) {
                        options.push({
                            candidate: ballots[i].candidates[j],
                            answers: Object.assign({}, answers)
                        });
                    }
                    answersPerBallotIndex.push({
                        ballotID: i,
                        options
                    });
                }
            }
            setAnswersPerBallot(answersPerBallotIndex);
        
    }

    const handleCheckboxChangeBallotType1 = (key) => {
        setAnswersPerBallot(prevState => {
            const ballotObj = prevState.find(ballot => ballot.ballotID === selectedIndex);
            for (const [_key, value] of Object.entries(ballotObj.options)) {
                if (_key === key) {
                    ballotObj.options[_key] = !value;
                } else {
                    ballotObj.options[_key] = false;
                }
            }

            return [...prevState];
        });
    }

   

    const handleCheckboxChangeBallotType2 = (candidate, key) => {
        setAnswersPerBallot(prevState => {
            const ballotObj = prevState[selectedIndex].options;
            const candidateObj = ballotObj.find(o => o.candidate === candidate);
            for (const [_key, value] of Object.entries(candidateObj.answers)) {
                if (_key === key) {
                    if (!value) {
                        candidateObj.answers[_key] = true;
                    }
                } else {
                    candidateObj.answers[_key] = false;
                }
            }
            return [...prevState];
        });
    }

    useEffect(() => {
        /*
        if (voteDetails) {
            const ballots = voteDetails.ballots;
            const answersPerBallotIndex = [];
            const answers = {
                'JA': false,
                'NEIN': false,
                'ENTHALTUNG': false,
            }
            for (let i = 0; i < ballots.length; i++) {
                if (ballots[i].ballotType === 1) {
                    answersPerBallotIndex.push({
                        ballotID: i,
                        options: Object.assign({}, answers)
                    });
                } else if (ballots[i].ballotType === 2) {
                    const options = []
                    for (let j = 0; j < ballots[i].candidates.length; j++) {
                        options.push({
                            candidate: ballots[i].candidates[j],
                            answers: Object.assign({}, answers)
                        });
                    }
                    answersPerBallotIndex.push({
                        ballotID: i,
                        options
                    });
                }
            }
            setAnswersPerBallot(answersPerBallotIndex);
        }*/
        if (voteDetails) setAnswersObjectFormat();
    }, [voteDetails,]);



    useEffect(() => {
        //console.log('answersPerBallot', answersPerBallot);
    }, [answersPerBallot]);

    useEffect(() => {
        const getVoteDetails = async (factory) => {
            try {
                const EVOTING_ABI = artifacts[2].abi;
                const voteContractAddr = await factory.get_voting('0x' + voteID);
                const contract = new Contract(voteContractAddr, EVOTING_ABI, l2Provider);
                const voteName = await contract.name();
                const voteDescription = await contract.description();
                const voteState = VOTING_STATES[(await contract.get_state())];
                const voteStartTime = (await contract.start_time()).toNumber();
                const voteEndTime = (await contract.end_time()).toNumber();
                const admin = await contract.admin();
                const _ballots = [];
                const ballots = await contract.get_ballot_papers();

                for (let i = 0; i < ballots.length; i++) {
                    const maxSelectableAnswer = ballots[i].maxSelectableAnswer.toNumber();
                    const ballot = {
                        ballotType: ballots[i].ballotType,
                        name: ballots[i].name,
                        information: ballots[i].information,
                        title: ballots[i].title,
                        candidates: ballots[i].candidates,
                        maxSelectableAnswer,
                        totalSelectedAnswers: 0
                    }
                    _ballots.push(ballot);
                }
                const data = {
                    voteName: voteName,
                    voteDescription: voteDescription,
                    voteStart: dayjs(voteStartTime * 1000),
                    voteEnd: dayjs(voteEndTime * 1000),
                    voteID: voteID,
                    voteState: voteState,
                    admin: admin,
                    ballots: _ballots,
                }
                setVoteDetails(data);
                //console.log('data', data);
                //console.log('ballots', data.ballots);
            } catch (error) {
                console.error(error);
            }
        }
        if (l2Contracts) {
            const factory = l2Contracts.FactoryEvoting;
            getVoteDetails(factory);
            //console.log('artifact', artifacts);
        }
    }, [l2Contracts, artifacts, l2Provider, voteID]);

    const handleClickBallot = (index) => {
        setSelectedIndex(index);
    }

    const [open, setOpen] = useState([]);
    const handleClick = (index) => {
        console.log(index);
        setOverview(false);
        setOpen(prev => {
            console.log('prev', prev)
            for(let i = 0; i < prev.length; i++) {
                if (i === index) {
                    console.log('hier');
                    prev[index] = true;//!prev[index];
                }else {
                    prev[i] = false;
                }
            }
            
            console.log('after', prev)
            return [...prev];
        });
        setSelectedIndex(index);
      };

      const handleCloseOverview = ({selectedIndex, newVoting, open}) => {
        setOverview(false);
        //setSelectedIndex(selectedIndex);
        console.log('val', open);
        setOpen(...open);
        if (newVoting) setAnswersObjectFormat();
    }

      useEffect(() => {
        if (voteDetails) {
            setOpen(new Array(voteDetails.ballots.length).fill(false));
        }
      }, [voteDetails]);

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
                
                <Card 
                    variant='outlined' 
                    sx={{ 
                        overflow: 'scroll',
                         }}>
                    <CardContent>
                    
                    <Typography variant='h6' gutterBottom marginBottom={2} >{voteDetails.ballots[selectedIndex].information}</Typography>
                    {voteDetails.ballots[selectedIndex].ballotType === 1 &&
                    <BallotType1 answersPerBallot={answersPerBallot[selectedIndex].options} handleCheckboxChangeBallotType1={handleCheckboxChangeBallotType1} restructure={true} selectedBallot={voteDetails.ballots[selectedIndex]} />
                    }
                    {voteDetails.ballots[selectedIndex].ballotType === 2 &&
                    <BallotType2 answersPerBallot={answersPerBallot[selectedIndex].options} handleCheckboxChangeBallotType2={handleCheckboxChangeBallotType2} restructure={true} selectedBallot={voteDetails.ballots[selectedIndex]} />
                    }
                    </CardContent>
                </Card>
            </Collapse>
            </>
        )
    }

    useEffect(() => {
        if (data.credentials) {
            const hash = '0x' + poseidon(['0x' + data.credentials.id]);
            const hashedID = ethers.utils.hexlify(ethers.BigNumber.from(hash));
            const pubKey = data.credentials.pk.toString(16);
            console.log('hashed id', hashedID);
            console.log('pub key', pubKey);
            console.log('pub key big int', BigInt('0x' + pubKey));
            const BACKEND_URL = '';

            const cb = async () => {
                let result;
                let { data } = await axios.get(BACKEND_URL + '/Vote/Voter');
                let contains = false;
                for (const id in data) {
                    data[id] = data[id].map((s) => BigInt("0x" + s));
                    for (let i = 0; i < data[id].length; i++) {
                        if (data[id][i] === BigInt('0x' + pubKey)) {
                            contains = true;
                        }
                    }
                }
                console.log('result', data);
                console.log('contains', contains);
            }

            const getTokens = async() => {
                const sessionId = 'f58277b8-84ac-4979-aeff-ee38b03cf93d';
                const pub = '5017868837e5d22477e75d69da6f7c2b219eb5d073d7e5dbaadf563812f34fa83f1d6f0078e0a0a2d06dde198a256a9fead8c208f91c1d6caa7af61b8836aa06d1d49471c52efecb898f63fd88cbe0f573739a7b10b68fe7a0b2c842c6619272'
                const result = await axios.post(BACKEND_URL + '/Vote/Voter/' + pub, {
                    sessionId
                });

                console.log('results 2', result);
            }

            //cb();
            //getTokens()
        }
    }, [data.credentials]);



    return (
        <>
            <Container sx={{
                height: '75vh',
            }}>

                <Box sx={{ 
                    display:`${ voteDetails!== null ? 'none': 'flex'}`, 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    marginTop: 10 }}
                >
                    {!voteDetails &&
                        <>
                            <Typography variant='h4' marginRight={2}>
                                Daten werden geladen
                            </Typography>
                            <CircularProgress size={30} disableShrink />
                        </>
                    }
                </Box>

                {(voteDetails && isVoterAuthenticated) &&
                    <>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: matches ? 'column' : 'row',
                            justifyContent: 'space-between',
                            marginTop: 3

                        }}>
                            <Box sx={{ justifyContent: 'flex-start' }}>
                                <Typography variant='h4' fontWeight={'bold'} marginRight={2} gutterBottom paragraph>
                                    {voteDetails.voteName}
                                </Typography>
                                <Typography variant='h6' marginRight={2} paragraph>
                                    {voteDetails.voteDescription}
                                </Typography>
                                
                            </Box>
                            <Box sx={{ justifyContent: 'flex-end' }}>
                                <Typography variant='h6' marginRight={2} sx={{
                                    width: {xs: 200, sm: 200, md: 200, lg: 200, xl: 200},
                                    border: 'solid 3px',
                                    borderColor: getElectionStateColor(voteDetails.voteState),
                                    borderRadius: 1,
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    color: getElectionStateColor(voteDetails.voteState)
                                }} >
                                    {voteDetails.voteState}
                                </Typography>
                            </Box>
                        </Box>

                        {voteDetails.voteState === VOTING_STATES[0] &&
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                                <Typography variant='h4'>
                                    Die Wahl hat noch nicht begonnen.
                                </Typography>
                            </Box>
                        }


                        {voteDetails.voteState === VOTING_STATES[1] &&
                            <>
                                {(answersPerBallot && !overview) &&
                                    <Box sx={{
                                        width: 1,
                                        height: '64.5vh',
                                        border: 'solid',
                                        borderWidth: '0px',
                                        borderColor: INPUT_LABEL_BACKGROUND_COLOR,
                                        display: 'flex', 
                                        flexDirection: matches ? 'column' : 'row', 
                                        marginTop: 5
                                    }}
                                    >
                                        <Box sx={{
                                            width: matches? 1: 1,
                                            height: '75vh',
                                            paddingLeft: matches ? 0 :1,
                                            paddingRight: matches ? 0 :1 
                                        }}
                                       // width={1/2} height={'75vh'} paddingLeft={1} paddingRight={1} 
                                            //border='solid 1px' 
                                        >
                                            <SearchField fullWidth />
                                            <List 
                                                id='ballots-list'
                                                sx={{ 
                                                maxHeight: 1, 
                                                overflow: 'scroll', 
                                                marginTop: 1, 
                                                //border: 'solid 1px' 
                                                }}>
                                                {voteDetails.ballots.map((ballot, index) => renderBallotAsButton(index, ballot))}
                                            </List>
                                        </Box>
                                        
                                        <Box sx={{
                                            width: 1,
                                            height: '75vh',
                                            display: matches ? 'none' : 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',

                                            backgroundColor: '#FAFAFA',
                                        }}>
                                            <Card variant='outlined' sx={{ 
                                               // maxHeight: '50vh', 
                                                overflow: 'scroll', marginTop: 6, width: 1.9 / 2, }}>
                                                <CardContent>
                                                    <Typography variant='h5' fontWeight={'bold'} gutterBottom marginBottom={1} >{voteDetails.ballots[selectedIndex].name}</Typography>
                                                    <Typography variant='h6' gutterBottom marginBottom={2} >{voteDetails.ballots[selectedIndex].information}</Typography>
                                                    {voteDetails.ballots[selectedIndex].ballotType === 1 &&
                                                        <BallotType1 answersPerBallot={answersPerBallot[selectedIndex].options} handleCheckboxChangeBallotType1={handleCheckboxChangeBallotType1} restructure={true} selectedBallot={voteDetails.ballots[selectedIndex]} />
                                                    }
                                                    {voteDetails.ballots[selectedIndex].ballotType === 2 &&
                                                        <BallotType2 answersPerBallot={answersPerBallot[selectedIndex].options} handleCheckboxChangeBallotType2={handleCheckboxChangeBallotType2} restructure={true} selectedBallot={voteDetails.ballots[selectedIndex]} />
                                                    }
                                                </CardContent>
                                            </Card>

                                            <Box display='flex' justifyContent='center' marginTop={2}>

                                                {(selectedIndex === voteDetails.ballots.length - 1 || selectedIndex > 0) &&
                                                    <Tooltip>
                                                        <IconButton size='large' onClick={previousBallot}>
                                                            <ArrowBackIcon sx={{ fontSize: 30, }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                }

                                                {(selectedIndex !== voteDetails.ballots.length - 1 ) &&
                                                    <Tooltip>
                                                        <IconButton size='large' onClick={nextBallot}>
                                                            <ArrowForwardIcon sx={{ fontSize: 30 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                }
                                                
                                            </Box>

                                            
                                        </Box>
                                        
                                    </Box>
                                    
                                }
                                <Box width={matches ? 1 : 1.9 / 2} marginTop={3} >
                                                <Button variant='contained' size='large' fullWidth onClick={() => setOverview(true)}
                                                    sx={{
                                                        fontSize: 10,
                                                        //fontWeight: 'bold',
                                                        //backgroundColor: ELECTION_IN_PREPARATION_COLOR
                                                    }}
                                                >
                                                    Weiter zur Kontrolle
                                                </Button>
                                            </Box>
                                {overview &&
                                    <ControlOverview handleCloseOverview={handleCloseOverview} ballots={voteDetails.ballots} answersPerBallot={answersPerBallot} credentials={data.credentials} />
                                }
                            </>
                        }

                        
                    </>
                }
                
            </Container>
        
        </>
    )
}


/**
 * <Typography variant='h6' marginRight={2} component='div' display={'flex'}>
                                    <Typography variant='h6' fontWeight={600} marginRight={1} noWrap>Beginn:</Typography>
                                    {voteDetails.voteStart.format('DD.MM.YYYY-hh:m')}
                                </Typography>
                                <Typography variant='h6' marginRight={2} component='div' display={'flex'}>
                                    <Typography variant='h6' fontWeight={600} marginRight={1} noWrap>Ende:</Typography>
                                     {voteDetails.voteEnd.format('DD.MM.YYYY-hh:m')}
                                </Typography>
 */