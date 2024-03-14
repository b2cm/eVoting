import { 
    useEffect, 
    useLayoutEffect,
    useCallback,
    useState,
    useMemo,
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
import { useLocation, useParams } from 'react-router-dom';
import { Contract } from 'zksync-web3';
import { VOTING_STATES, ZERO_ADDRESS } from '../../../utils/constantes';
import dayjs from 'dayjs';

export default function DisplayVote(props) {
    const { state, dispatch } = useEth();
    const [votingDetails, setVotingsDetails] = useState(null);
 
    //const { voteDetails, dispatchVotingDetails } = props;
    const {  l2Contracts, signer, l2Provider, paymaster, artifacts } = state;
    const [whichBallots, setWhichBallots] = useState('old'); // Old = original ballots loaded from the smart contract.
    const [tabValue, setTabValue] = useState(0);
    //const { voteID } = useParams();
    const location = useLocation();
    const voteDetails = JSON.parse(location.state);
    
    const [voteName, setVoteName] = useState(voteDetails.voteName);
    const [voteDescription, setVoteDescription] = useState(voteDetails.voteDescription);
    const [voteID, setVoteID] = useState(voteDetails.voteID);
    const [voteStart, setVoteStart] = useState(dayjs(voteDetails.voteStartTime*1000));
    const [voteEnd, setVoteEnd] = useState(dayjs(voteDetails.voteEndTime*1000));
    const [ballots, setBallots] = useState(voteDetails.ballotPapers);
    const [voteState, setVoteState] = useState(voteDetails.voteState);
    const [ballots_to_add, setBallots_to_add] = useState([]);
    const [ballots_to_delete, setBallots_to_delete] = useState([]);
    const [ballots_to_update, setBallots_to_update] = useState([]);
    const [isEditable, setIsEditable] = useState(() => {
      return voteState === VOTING_STATES[0] ? true : false;
    });

    const admin = voteDetails.admin;
   
    const [abi, setAbi] = useState(artifacts[2].abi);
    const contract = useMemo(() => {
      return new Contract(voteDetails.contractAddr, abi, l2Provider);
    }, [voteDetails.contractAddr, abi, l2Provider]);

    useEffect(() => {
      setAbi(artifacts[2].abi);
    }, [artifacts])
    

    const validateDate = (voteStart, voteEnd) => {
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




    useEffect(() => {   
      const getContractData = async () => {
          try {
            
              if (voteDetails.contractAddr !== ZERO_ADDRESS) {
                  const EVOTING_ABI = artifacts[2].abi;
                  const contract = new Contract(voteDetails.contractAddr, EVOTING_ABI, l2Provider);
                  const _voteState = VOTING_STATES[await contract.get_state()];
                  if (_voteState !== voteState) {
                    const _isEditable = voteState === VOTING_STATES[0] ? true : false;
                    setVoteState(_voteState);
                    setIsEditable(_isEditable);
                  }
                  const _ballots = [];
                  for (let i = 0; i < ballots.length; i++) {
                    try {
                      const num = ethers.BigNumber.from(ballots[i][5].hex).toNumber(); // We need to recreate the BigNumber because we stringify the data.
                      const ballot = {
                        ballotType: ballots[i][0],
                        name: ballots[i][1],
                        information: ballots[i][2],
                        title: ballots[i][3],
                        candidates: ballots[i][4],
                        maxSelectableAnswer: num
                    }
                    _ballots.push(ballot);
                    setBallots([..._ballots]);
                    } catch (error) {
                      console.error(error);
                    }
                      
                  }
              }
          } catch (error) {
              console.error(error);
          }
      } 

      if (l2Contracts) {
          //const factory = l2Contracts.FactoryEvoting;
          getContractData();
      }

  }, [l2Contracts, voteID, l2Provider, artifacts]);

  return (
   <>
     <Container sx={{
        height: '81vh', //'85%',
        //overflow: 'scroll'
    }}>
        <VoteDetails 
            isEditable={isEditable}
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
            voteID={voteID.slice(2)} 
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
    <Footer 
      isActive={isEditable} 
      isNewVoting={false} 
      handleCreateNewVote={handleUpdateVoting}
      handleCancelVoting={handleCancelVoting} 
    />
   </>
  
  )
}



