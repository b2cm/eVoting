import { 
    useCallback,
    useState,
    useEffect
} from 'react';
import { 
    Container,
    LinearProgress,
    styled,
    linearProgressClasses } from '@mui/material';
import { utils } from "zksync-web3";
import * as ethers from 'ethers';
import Footer from '../../common/Footer';
import { useEth,} from "../../../contexts/EthContext";
import { TransactionDialogBox } from '../../common/TransactionDialogBox';
import VotingTabs from '../../common/VotingTabs';
import { VOTING_STATES } from '../../../utils/constantes';
import dayjs from 'dayjs';
import VoteDetails from '../../common/VoteDetails';



export default function NewVote(props) {
    const [openDialog, setOpenDialog] = useState(false);
    const [waitingMessage, setWaitingMessage] = useState('Die Wahldaten werden verarbeitet');
    const [progress, setProgress] = useState(0);
    const [buffer, setBuffer] = useState(10);
    const { state, } = useEth();
    const { l2Contracts, signer, l2Provider, paymaster} = state;
   
    const emptyBallot = {
        ballotType: 1,
        name: '', 
        information: '', 
        title:'',
        candidates: [],
    };
    const [voteName, setVoteName] = useState('');
    const [voteDescription, setVoteDescription] = useState('');
    const [voteStart, setVoteStart] = useState(dayjs());
    const [voteEnd, setVoteEnd] = useState(dayjs().add(1, 'day'));
    const [ballots, setBallots] = useState([emptyBallot]);
    const [voteID, setVoteID] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const voteState = VOTING_STATES[0];
    const isEditable = true;    
    
    const validateDate = () => {
        return voteStart.isBefore(voteEnd);
    }

    const handleCloseDialog = () => {
        setOpenDialog(false); 
        setProgress(0);
        setBuffer(10);
        setWaitingMessage('Die Wahldaten werden verarbeitet.');
        // Reset the vote daten on success
        if (progress === 100) {
            setVoteName('');
            setVoteDescription('');
            setVoteStart(dayjs());
            setVoteEnd(dayjs().add(1, 'day'));
            setVoteID('');
            setBallots([emptyBallot]); 
            setTabValue(0);
        }
    }

    const handleCreateNewVoteClick = useCallback(async() => {
        setOpenDialog(true);
        setProgress(40);
        setBuffer(60);
        try {
            const factory = l2Contracts.FactoryEvoting;
            const start = voteStart.unix();
            const end = voteEnd.unix()
            const _voteID = `0x${voteID}`;
            const gasPrice = await l2Provider.getGasPrice();
            const paymasterBalance = await l2Provider.getBalance(paymaster);
            console.log('paymaster balance', ethers.utils.formatEther(paymasterBalance));
          
             // Encoding the ApprovalBased paymaster flow's input
             const paymasterParams = utils.getPaymasterParams(paymaster, {
              type: 'General',
              innerInput: new Uint8Array(),
          });
          
            // Estimate gas fee
            const gasLimit = await factory.connect(signer).estimateGas.new_voting(
              _voteID,
              voteName,
              voteDescription,
              start,
              end,
              ballots,
               {
                
                customData: {
                    gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
                    paymasterParams
                },
            });
          
            const fee = gasPrice.mul(gasLimit);
            console.log('fee', ethers.utils.formatEther(fee));
            
            const txHandle = await factory.connect(signer).new_voting(
                _voteID,
                voteName,
                voteDescription,
                start,
                end,
                ballots,
                {
                  // Provide gas params manually
                  maxFeePerGas: gasPrice,
                  maxPriorityFeePerGas: gasPrice,
                  gasLimit: gasLimit,
            
                  // paymaster info
                  customData: {
                    paymasterParams,
                    gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
                   },
                }
               );
            
              setWaitingMessage('Die Wahl wird erstellt');
              setProgress(60);
              setBuffer(100);
              const receipt = await txHandle.wait();
              const events = receipt.events;
              events.forEach(e => {
                if(e.event === 'VotingCreated') {
                    console.log(e.event, ':', e.args);
                    setWaitingMessage('Die Wahl wurde erfolgreich erstellt');
                    setProgress(100);
                }
              });
        } catch (error) {
            let message = '';
            message = error.message;
            if (error.code === 'ACTION_REJECTED') message = 'User denied message signature.';

            setWaitingMessage(message);
            console.log(error);
        }
            
    }, [signer, voteName, voteDescription, voteID, voteStart, voteEnd, l2Contracts, ballots, l2Provider, paymaster])

   

    const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
        height: 10,
        borderRadius: 5,
        [`&.${linearProgressClasses.colorPrimary}`]: {
          backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
        },
        [`& .${linearProgressClasses.bar}`]: {
          borderRadius: 5,
          backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
        },
    }));
      

  return (
    <>
        <Container 
            sx={{
            height: '81.8vh', //'85%',
            //overflow: 'scroll'
            }}
        >
        <VoteDetails 
            voteName={voteName}
            voteDescription={voteDescription}
            voteState={voteState}
            setVoteName={setVoteName}
            setVoteDescription={setVoteDescription}
        />
        <VotingTabs
            tabValue={tabValue}
            setTabValue={setTabValue}
            ballots={ballots} 
            setBallots={setBallots} 
            voteName={voteName} 
            setVoteName={setVoteName} 
            voteDescription={voteDescription}
            voteState={voteState}
            isEditable={isEditable}
            voteID={voteID}
            setVoteID={setVoteID}
            voteStart={voteStart}
            setVoteStart={setVoteStart}
            voteEnd={voteEnd}
            setVoteEnd={setVoteEnd}
         />
       
    </Container>

    <TransactionDialogBox openDialog={openDialog} handleCloseDialog={handleCloseDialog} waitingMessage={waitingMessage} progress={progress} buffer={buffer} />

    <Footer isActive={true} handleCreateNewVote={handleCreateNewVoteClick} />
    </>
    
  
  )
}
