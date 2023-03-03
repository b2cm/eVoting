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
import { VOTING_STATES } from '../../../utils/constantes';
import DisplayVote from './DisplayVote';

export default function LoadVotingsDetails() {
    const [votingDetails, setVotingsDetails] = useState(null);
    const { state, } = useEth();
    //const { votingDetails, dispatchVotingDetails } = useVotingDetails();
    const { l2Contracts, artifacts, l2Provider } = state;
    const { voteID } = useParams();
    const waitingMessage = 'Daten werden geladen'



    useEffect(() => {   
        const getContractData = async factory => {
            try {
                const zeroAddr = '0x0000000000000000000000000000000000000000'
                const votingAddr = await factory.get_voting('0x' + voteID);
                //console.log('address', votingAddr);
                if (votingAddr !== zeroAddr) {
                    const EVOTING_ABI = artifacts[2].abi;
                    const contract = new Contract(votingAddr, EVOTING_ABI, l2Provider);
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
            
                    const isEditable = voteState === VOTING_STATES[0] ? true : false;
                    const data = {
                        isEditable,
                        voteName: voteName,
                        voteDescription: voteDescription,
                        voteStart: dayjs(voteStartTime * 1000),
                        voteEnd: dayjs(voteEndTime * 1000),
                        voteID: voteID,
                        voteState: voteState,
                        admin: admin,
                        ballots: _ballots,
                        ballots_to_add: [],
                        ballots_to_delete: [],
                        ballots_to_update: [],
                        contract
                    }
                    setVotingsDetails(data);
                    /*
                    dispatchVotingDetails({
                        type: actions.init,
                        data
                    });
                    */
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