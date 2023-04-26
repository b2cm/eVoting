import { 
    useEffect, 
    useLayoutEffect,
    useCallback,
    useState,
} from 'react';
import { 
    Container,
 } from '@mui/material';
import { utils } from "zksync-web3";
import * as ethers from 'ethers';
import VotingTabs from '../../common/VotingTabs';
import Footer from '../../common/Footer';
import { useEth,} from "../../../contexts/EthContext";
import VoteDetails from '../../common/VoteDetails';

export default function DisplayVote(props) {
    const { state, dispatch } = useEth();
    const { voteDetails, dispatchVotingDetails } = props;
    const {  l2Contracts, signer, l2Provider, paymaster } = state;
    const [whichBallots, setWhichBallots] = useState('old'); // Old = original ballots loaded from the smart contract.
    const [tabValue, setTabValue] = useState(0);
    const [voteName, setVoteName] = useState(voteDetails.voteName);
    const [voteDescription, setVoteDescription] = useState(voteDetails.voteDescription);
    const [voteID, setVoteID] = useState(voteDetails.voteID);
    const [voteStart, setVoteStart] = useState(voteDetails.voteStart);
    const [voteEnd, setVoteEnd] = useState(voteDetails.voteEnd);
    const [ballots, setBallots] = useState(voteDetails.ballots);
    const [ballots_to_add, setBallots_to_add] = useState(voteDetails.ballots_to_add);
    const [ballots_to_delete, setBallots_to_delete] = useState(voteDetails.ballots_to_delete);
    const [ballots_to_update, setBallots_to_update] = useState(voteDetails.ballots_to_update);
    const voteState = voteDetails.voteState;
    const isEditable = voteDetails.isEditable;
    const contract = voteDetails.contract;
    const admin = voteDetails.admin;
   
    const inputBackgroundColorHover = '#F7F7F7';
    const handleInputHover = isEditable ? inputBackgroundColorHover : 'white';
    
    const validateDate = () => {
        return voteStart.isBefore(voteEnd);
    }

      // Encoding the ApprovalBased paymaster flow's input
    const paymasterParams = utils.getPaymasterParams(paymaster, {
        type: 'General',
        innerInput: new Uint8Array(),
    });

    const handleCancelVoting = async() => {
        const gasPrice = await l2Provider.getGasPrice();

        const gasLimit = await contract.connect(signer).estimateGas.cancel_voting({
            customData: {
                gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
                paymasterParams
            },
        });
        const fee = gasPrice.mul(gasLimit);
        console.log('fee', ethers.utils.formatEther(fee));

       const txHandle = await contract.connect(signer).cancel_voting({
        // Provide gas params manually
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: gasPrice,
        gasLimit,
  
        // paymaster info
        customData: {
          paymasterParams,
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
         },
       });

       const receipt = await txHandle.wait();
       console.log('receipt', receipt);
    }


    const handleUpdateVoting = useCallback(async() => {
        const start = voteStart.unix();
        const end = voteEnd.unix()
        const gasPrice = await l2Provider.getGasPrice();
        console.log('gas price:', ethers.utils.formatEther(gasPrice));

        // Estimate gas fee for mint transaction
        const gasLimit = await contract.connect(signer).estimateGas.update_voting(
          {
            name: voteName,
            description: voteDescription,
            start_time: start,
            end_time: end,
          },
          ballots_to_update,
          ballots_to_add,
          ballots_to_delete,
           {
            customData: {
                gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
                paymasterParams
            },
        });
      
        const fee = gasPrice.mul(gasLimit);
        console.log('fee', ethers.utils.formatEther(fee));

        const txHandle = await contract.connect(signer).update_voting(
            {
                name: voteName,
                description: voteDescription,
                start_time: start,
                end_time: end,
            },
            ballots_to_update,
            ballots_to_add,
            ballots_to_delete,
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
          events.forEach(e => {
            console.log('event', e);
            if(e.event === 'VotingUpdated') {
                console.log(e.event, ':', e.args);
            }
          });
    
    }, [signer, voteName, voteDescription, voteStart, voteEnd, l2Provider, ballots_to_update, ballots_to_add, ballots_to_delete, paymasterParams, contract,]);



  return (
   <>
     <Container sx={{
        height: '81vh', //'85%',
        //overflow: 'scroll'
    }}>
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
            isEditable={isEditable}
            voteState={voteState} 
            voteName={voteName} 
            setVoteName={setVoteName}
            voteStart={voteStart} 
            setVoteStart={setVoteStart}
            setVoteEnd={setVoteEnd}
            voteEnd={voteEnd} 
            voteID={voteID} 
            ballots={ballots} 
            setBallots={setBallots} 
            ballots_to_add={ballots_to_add}
            setBallots_to_add={setBallots_to_add}
            ballots_to_delete={ballots_to_delete}
            setBallots_to_delete={setBallots_to_delete}
            ballots_to_update={ballots_to_update}
            setBallots_to_update={setBallots_to_update}
            setVoteID={setVoteID}
            whichBallots={whichBallots}
            setWhichBallots={setWhichBallots}
            admin={admin}
        />
        

    </Container>
    <Footer isActive={isEditable} isNewVoting={false} handleCreateNewVote={handleUpdateVoting} handleCancelVoting={handleCancelVoting} />
   </>
  
  )
}



