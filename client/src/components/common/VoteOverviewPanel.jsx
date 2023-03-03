import {
    useState,
    useEffect
} from 'react';
import { useEth } from '../../contexts/EthContext';

import { 
    Box, 
    Input,
} from '@mui/material';
import { createHash } from 'crypto';
import MyDateTimePicker from './MyDateTimePicker';
import { 
    BORDER_COLOR,
    INPUT_BACKGROUND_HOVER_COLOR,
    TEXT_COLOR,
 } from '../../utils/colors';
 import { VOTE_CONFIG_LABELS } from '../../utils/constantes';
 import { useLocation } from 'react-router-dom';



export default function VoteOverviewPanel(props) {
    const { state: { accounts, }  } = useEth();
    const [_voteID, set_voteID] = useState('');
    const location = useLocation();
    const { 
        isEditable, 
        voteName, 
        setVoteName,
        voteID,
        setVoteID,
        voteStart,
        setVoteStart, 
        voteEnd, 
        setVoteEnd,
        ballots, 
        admin
        } = props;
        
    const ballotsCount = ballots.length;
   
   const adminAdr = admin ? admin : 
                    accounts ? `${accounts[0]}` : '';

    const computeVoteID = useEffect(() => {
        const isCreateNewVoteComponent = location.pathname.startsWith('/vote/create');
        if (isCreateNewVoteComponent) {
            const sha256 = createHash('sha256');
            const wahlID = sha256.update(voteName + adminAdr + ballots + voteStart + voteEnd + Date.now()).digest('hex');
            setVoteID(wahlID)
            set_voteID(wahlID);
        }
    }, [voteName, ballots, voteStart, voteEnd, adminAdr, location.pathname, setVoteID ]);
    
    const link = `localhost:3000/vote/${!voteID ? computeVoteID : voteID}`;
   

    const handleChangeVoteName = event => {
        setVoteName(event.target.value);
    }
    
 

  return (
    <Box marginTop={3}>
        <Box paddingBottom={3} fontSize={16} fontWeight={550}>
            Ihre Wahlkonfigurationen
        </Box>
        <Box 
            sx={{
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {VOTE_CONFIG_LABELS.map((e, index) => (
                <Box 
                    key={index}
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        marginBottom:2,
                    }}
                >
                    <Input 
                        disableUnderline
                        disabled
                        defaultValue={e}
                        inputProps={{ style: { WebkitTextFillColor: TEXT_COLOR, } }}
                        sx={{ 
                            width:1/3, 
                            height:32, 
                            paddingLeft:1, 
                            border:'solid 1px', 
                            BORDER_COLOR: BORDER_COLOR,
                            fontSize: 12,
                            backgroundColor: '#F7F7F7',
                        }} 
                    />
                        
                    {index===3 ? 
                        <>
                            <MyDateTimePicker key={0} isEditable={isEditable} label='Start' value={voteStart} setValue={setVoteStart} />
                            <MyDateTimePicker key={1} isEditable={isEditable} label='Ende' value={voteEnd} setValue={setVoteEnd} />
                        </> : 
                        <Input 
                            required={index===0 || index===1 }
                            disabled={index===1 || index===2 || index===4 || index===5 || (index===0 && !isEditable)}
                            disableUnderline 
                            placeholder={index===0 ? 'Unbenanntes Voting' : ''} 
                            value={
                                index===0 ? voteName : 
                                index===1 ? adminAdr : 
                                index===2 ? ballotsCount : 
                                index===4 ? !voteID? computeVoteID: voteID : 
                                index===5 && link} 
                            onChange={handleChangeVoteName} 
                            inputProps={{ style: { WebkitTextFillColor: TEXT_COLOR, } }}
                            sx={{ 
                                width:1, 
                                height:32, 
                                paddingLeft:1, 
                                border:'solid 1px',
                                BORDER_COLOR: BORDER_COLOR, 
                                borderLeft:'none', 
                                fontSize: 12, 
                                //backgroundColor: INPUT_BACKGROUND_COLOR,
                                ":hover":{
                                    backgroundColor: INPUT_BACKGROUND_HOVER_COLOR,
                                }
                            }}
                        />
                        }
                    </Box>
            ))}
             
        </Box>
       
        
       
    </Box>
  )
}