import {
    useEffect,
    useState}from 'react';
import {
    Container,
    Box,
    Typography,
    CircularProgress
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useEth } from '../../../contexts/EthContext';
import { Contract } from 'zksync-web3';
import dayjs from 'dayjs';
import Footer from '../../common/Footer';
import { VOTING_STATES, ZERO_ADDRESS } from '../../../utils/constantes';
import DisplayVote from './DisplayVote';
import { useLocation } from 'react-router-dom';

export default function LoadVotingsDetails(props) {
    const location = useLocation();
    const [votingDetails, setVotingsDetails] = useState(null);
    const { state, } = useEth();
    //const { votingDetails, dispatchVotingDetails } = useVotingDetails();
    const { l2Contracts, artifacts, l2Provider } = state;
    const { voteID } = useParams();
    const waitingMessage = 'Daten werden geladen'

    console.log('props', location);


    useEffect(() => {   
        const getContractData = async factory => {
            try {
                const votingAddr = await factory.get_voting('0x' + voteID);
                //console.log('address', votingAddr);
                if (votingAddr !== ZERO_ADDRESS) {
                    const EVOTING_ABI = artifacts[2].abi;
                    const contract = new Contract(votingAddr, EVOTING_ABI, l2Provider);

                    let data = await contract.get_details();
                    console.log('data', data);
                    const voteName = data._name;
                    const voteDescription = data._description;
                    const voteState = VOTING_STATES[(data._state)];
                    const voteStartTime = (data._start_time).toNumber();
                    const voteEndTime = (data._end_time).toNumber();
                    const voteID = data._voteID;
                    const admin = await contract.admin();
                    const _ballots = [];
                    const ballots = data._ballot_papers;
                
                    for (let i = 0; i < ballots.length; i++) {
                        const ballot = {
                            ballotType: ballots[i].ballotType,
                            name: ballots[i].name,
                            information: ballots[i].information,
                            title: ballots[i].title,
                            candidates: ballots[i].candidates,
                            maxSelectableAnswer: ballots[i].maxSelectableAnswer
                        }
                        _ballots.push(ballot);
                    }
            
                    const isEditable = voteState === VOTING_STATES[0] ? true : false;
                    data = {
                        isEditable,
                        voteName: voteName,
                        voteDescription: voteDescription,
                        voteStart: dayjs(voteStartTime * 1000),
                        voteEnd: dayjs(voteEndTime * 1000),
                        voteID: voteID.slice(2),
                        voteState: voteState,
                        admin: admin,
                        ballots: _ballots,
                        ballots_to_add: [],
                        ballots_to_delete: [],
                        ballots_to_update: [],
                        contract
                    }
                    setVotingsDetails(data);
                }
            } catch (error) {
                console.error(error);
            }
        } 

        if (l2Contracts) {
            const factory = l2Contracts.FactoryEvoting;
            getContractData(factory);
        }

    }, [l2Contracts, voteID, l2Provider, artifacts]);
    


  return (
    <>
    {!votingDetails && 
        <Container sx={{
            width: '100%',
            height: '81.5vh',
            paddingTop: 10,
            }} >
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
                <CircularProgress size={30} disableShrink/>
            </Box>
            
        </Container>}
    {votingDetails && <DisplayVote voteDetails={votingDetails} />}
    <Footer />
    </>
    
  )
}