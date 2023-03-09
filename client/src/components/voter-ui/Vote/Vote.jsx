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
import { useParams } from 'react-router-dom';
import { useEth } from '../../../contexts/EthContext';
import { getElectionStateColor, getVoteDetails } from '../../../utils/utils';
import { Contract } from 'zksync-web3';
import dayjs from 'dayjs';
import { VOTING_STATES } from '../../../utils/constantes';
import { BORDER_COLOR, ICON_COLOR, INPUT_LABEL_BACKGROUND_COLOR } from '../../../utils/colors';
import BallotType1 from '../../common/ballot/BallotType1';
import BallotType2 from '../../common/ballot/BallotType2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchField from '../../common/SearchField';
import Footer from '../../common/Footer';

export default function Vote(props) {
    const [voteDetails, setVoteDetails] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [answersPerBallot, setAnswersPerBallot] = useState(null);
    const { state } = useEth();
    const { l2Contracts, artifacts, l2Provider } = state;
    const { isAuthenticated } = props;
    const { voteID } = useParams();

    const nextBallot = () => {
        setSelectedIndex(selectedIndex => selectedIndex + 1);
    }

    const previousBallot = () => {
        setSelectedIndex(selectedIndex => selectedIndex - 1);
    }

    const handleCheckboxChangeBallotType1 = (key) => {
        setAnswersPerBallot(prevState => {
            const ballotObj = prevState.find(ballot => ballot.ballotID === selectedIndex);
            for (const [_key, value] of Object.entries(ballotObj.option)) {
                if (_key === key) {
                    ballotObj.option[_key] = !value;
                } else {
                    ballotObj.option[_key] = false;
                }
            }
            
            return [...prevState];
        });
    }

    const handleCheckboxChangeBallotType2 = (candidate, key) => {
        setAnswersPerBallot(prevState => {
            const candidateObj = prevState[selectedIndex].options.find(o => o.candidate === candidate);
            for (const [_key, value] of Object.entries(candidateObj.answers)) {
                if (_key === key) {
                    candidateObj.answers[_key] = !value;
                } else {
                    candidateObj.answers[_key] = false;
                }
            }
            return [...prevState];
        });
    }

    useEffect(() => {
        if(voteDetails) {
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
                        option: Object.assign({}, answers)
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
    }, [voteDetails]);

    useEffect(() => {
        console.log('answersPerBallot', answersPerBallot);
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
                    const ballot = {
                        ballotType: ballots[i].ballotType,
                        name: ballots[i].name,
                        information: ballots[i].information,
                        title: ballots[i].title,
                        candidates: ballots[i].candidates
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
                console.log('data', data); 
                const color = getElectionStateColor(data.voteState);
                console.log('color', color);
                console.log('ballots', data.ballots);
            } catch (error) {
                console.error(error);
            }
        } 
       if (l2Contracts) {
        const factory = l2Contracts.FactoryEvoting;
        getVoteDetails(factory);
       }
    }, [l2Contracts, artifacts, l2Provider, voteID]);

    const handleClickBallot = (index) => {
        setSelectedIndex(index);
    }

    const renderBallotAsButton = (index, ballot ) => {
        return (
            <ListItemButton key={index} 
                    selected={ selectedIndex === index } 
                    onClick={() => handleClickBallot(index)}
                    sx={{ 
                        border: 'solid 1px #CCCCCC',  
                        borderRadius: '0px',
                        marginBottom: 1, 
                    }}>
                    <ListItemIcon style={{ minWidth: '30px'}} >
                        <BallotIcon sx={{ width: 20, height: 20, color: ICON_COLOR}}/>
                    </ListItemIcon>
                    <ListItemText 
                        disableTypography sx={{ 
                        marginLeft: 0,
                        width: 1,
                        overflowX: 'hidden',
                        fontSize: 12,
                        fontWeight: 530,
                        color: 'grey'}} >
                        {ballot.name === '' ? 'Unbenannt' : ballot.name}
                    </ListItemText>
                </ListItemButton>
        )
    }

    

  return (
    <>
    <Container sx={{
        height: '75vh',
    }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
            {!voteDetails && 
                <>
                <Typography variant='h4' marginRight={2}>
                    Daten werden geladen
                </Typography>
                <CircularProgress size={30} disableShrink />
                </>
            }
        </Box>
        
        {voteDetails && 
           <>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    justifyContent: 'space-between',
                     
                    }}>
                    <Box sx={{justifyContent: 'flex-start'}}>
                        <Typography variant='h4' marginRight={2}>
                            {voteDetails.voteName}
                        </Typography>
                        <Typography variant='h6' marginRight={2}>
                            {voteDetails.voteDescription}
                        </Typography>
                        <Typography variant='h6' marginRight={2} component='div' display={'flex'}>
                            <Typography variant='h6' fontWeight={600} marginRight={1}>Wahlzeitraum:</Typography>
                            {voteDetails.voteStart.format('DD.MM.YYYY-hh:m')} - {voteDetails.voteEnd.format('DD.MM.YYYY-hh:m')}
                        </Typography>
                    </Box>
                    <Box sx={{justifyContent: 'flex-end'}}>
                        <Typography variant='h6' marginRight={2} sx={{
                            width: 200,
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 10}}>
                        <Typography variant='h4'>
                            Die Wahl hat noch nicht begonnen.
                        </Typography>
                    </Box>
                }


                {voteDetails.voteState === VOTING_STATES[1] && 
                   <>
                   {answersPerBallot && 
                        <Box sx={{ 
                            width: 1, 
                            height: '64.5vh',
                            border: 'solid', 
                            borderWidth: '0px', 
                            borderColor: INPUT_LABEL_BACKGROUND_COLOR, 
                            display: 'flex', flexDirection: 'row', marginTop: 5}}
                        >
                            <Box width={1/2} height={1} paddingLeft={1} paddingRight={1}>
                                <SearchField fullWidth/>
                                <List sx={{ marginTop: 1}}>
                                    {voteDetails.ballots.map((ballot, index) => renderBallotAsButton(index, ballot))}
                                </List>
                            </Box>
                            <Divider orientation='vertical' flexItem />
                            <Box sx={{
                                width: 1, 
                                //height: '70vh',
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center',
                                
                                backgroundColor: '#FAFAFA',
                                }}>
                                <Card sx={{ maxHeight: 550, overflow: 'scroll', marginTop: 7.5, width: 1.9/2, }}>
                                    <CardContent>
                                        <Typography variant='h5' gutterBottom marginBottom={1} >{voteDetails.ballots[selectedIndex].name}</Typography>
                                        <Typography variant='h6' gutterBottom marginBottom={2} >{voteDetails.ballots[selectedIndex].information}</Typography>
                                        {voteDetails.ballots[selectedIndex].ballotType === 1 && 
                                            <BallotType1 answersPerBallot={answersPerBallot[selectedIndex].option} handleCheckboxChangeBallotType1={handleCheckboxChangeBallotType1} restructure={true} isEditable={false} selectedBallot={voteDetails.ballots[selectedIndex]} />
                                        }
                                        {voteDetails.ballots[selectedIndex].ballotType === 2 && 
                                            <BallotType2 answersPerBallot={answersPerBallot[selectedIndex].options}  handleCheckboxChangeBallotType2={handleCheckboxChangeBallotType2} restructure={true} isEditable={false} selectedBallot={voteDetails.ballots[selectedIndex]} />
                                        }
                                    </CardContent>
                                </Card>

                                <Box display='flex' justifyContent='center' marginTop={2}>
                                    {selectedIndex === 0 &&
                                        <Tooltip>
                                            <IconButton size='large' onClick={nextBallot}>
                                                <ArrowForwardIcon sx={{ fontSize: 30}}/>
                                            </IconButton>
                                        </Tooltip>
                                    }

                                    {selectedIndex === voteDetails.ballots.length - 1 &&
                                        <Tooltip>
                                            <IconButton size='large' onClick={previousBallot}>
                                                <ArrowBackIcon sx={{ fontSize: 30,}} />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                </Box>

                                <Box width={1.9/2} marginTop={2} marginBottom={5} >
                                    <Button variant='contained' size='large' fullWidth>
                                        Weiter zur Kontrolle
                                    </Button>
                                </Box>
                            </Box>
                    </Box>
                   }
                   </>
                }
           </>
        }
    </Container>
    <Footer />
    </>
  )
}
