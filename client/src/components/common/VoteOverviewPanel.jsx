import {
    useState,
    useEffect
} from 'react';
import { useEth } from '../../contexts/EthContext';

import { 
    Box, 
    Input,
    InputLabel,
    TextField,
    Typography,
} from '@mui/material';
import { createHash } from 'crypto';
import MyDateTimePicker from './MyDateTimePicker';
import { 
    BORDER_COLOR,
    INPUT_BACKGROUND_HOVER_COLOR,
    INPUT_LABEL_BACKGROUND_COLOR,
    TEXT_COLOR,
    INPUT_BACKGROUND_COLOR,
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

    useEffect(() => {
        const isCreateNewVoteComponent = location.pathname.startsWith('/admin/vote/create');
        if (isCreateNewVoteComponent) {
            const sha256 = createHash('sha256');
            const wahlID = sha256.update(voteName + adminAdr + ballots + voteStart + voteEnd + Date.now()).digest('hex');
            setVoteID(wahlID)
            //set_voteID(wahlID);
        }
    }, [voteName, ballots, voteStart, voteEnd, adminAdr, location.pathname, setVoteID ]);
    
    const link = `localhost:3000/vote/voting-cockpit/${voteID}`;

    console.log('vote id', voteID)
    console.log('_vote id', _voteID)

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
                    
                    <Typography variant='h6' component='div' sx={{
                        display: {xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex'},
                        //justifyContent: 'center',
                        paddingLeft: 1,
                        alignItems: 'center',
                        width: '40%',
                        border: 'solid 1px',
                        borderColor: INPUT_LABEL_BACKGROUND_COLOR,
                        borderRadius: 0,
                        borderRight: 'none',
                        backgroundColor: INPUT_BACKGROUND_COLOR,
        
                    }}>
                        {e}
                    </Typography>
                    
                        
                    {index===3 ? 
                        <Box sx={{
                            width: 1,
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between'

                        }}>
                            <MyDateTimePicker key={0} isEditable={isEditable} label='Start' value={voteStart} setValue={setVoteStart} />
                            <span style={{marginRight: 5}} />
                            <MyDateTimePicker key={1} isEditable={isEditable} label='Ende' value={voteEnd} setValue={setVoteEnd} />
                        </Box> : 
                        <>
                        <Box sx={{
                            width: 1,
                            display: {xs: 'none', sm: 'none', md: 'block', lg: 'block', xl: 'block'}
                        }}>
                        <TextField 
                        size='small'
                        variant='outlined'
                            required={index===0 || index===1 }
                            disabled={index===1 || index===2 || index===4 || index===5 || (index===0 && !isEditable)}
                            placeholder={index===0 ? 'Unbenanntes Voting' : ''} 
                            value={
                                index===0 ? voteName : 
                                index===1 ? adminAdr : 
                                index===2 ? ballotsCount : 
                                index===4 ? voteID : 
                                index===5 && link} 
                            onChange={handleChangeVoteName} 
                            inputProps={{ 
                                'aria-label': 'label',
                               
                                style: { WebkitTextFillColor: TEXT_COLOR, fontSize: 12,} }}
                            
                            sx={{ 
                                width:1, 
                               // height:32, 
                               // paddingLeft:1, 
                               // border:'solid 1px',
                                //BORDER_COLOR: BORDER_COLOR, 
                               // borderLeft:'none', 
                                //fontSize: 12, 
                                //backgroundColor: INPUT_BACKGROUND_COLOR,
                                ":hover":{
                                   backgroundColor: INPUT_BACKGROUND_HOVER_COLOR,
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        border: 'solid 1px',
                                        borderRadius:0,
                                    },
                                },
                               
                            }}
                        />
                        </Box>
                        <Box sx={{
                            width: 1,
                            display: {xs: 'block', sm: 'block', md: 'none', lg: 'none', xl: 'none'}
                        }}>
                        <TextField 
                        size='small'
                        variant='outlined'
                        label={e}
                        hiddenLabel={true}
                        
                            required={index===0 || index===1 }
                            disabled={index===1 || index===2 || index===4 || index===5 || (index===0 && !isEditable)}
                            placeholder={index===0 ? 'Unbenanntes Voting' : ''} 
                            value={
                                index===0 ? voteName : 
                                index===1 ? adminAdr : 
                                index===2 ? ballotsCount : 
                                index===4 ? voteID : 
                                index===5 && link} 
                            onChange={handleChangeVoteName} 
                            inputProps={{ 
                                'aria-label': 'label',
                               
                                style: { WebkitTextFillColor: TEXT_COLOR, fontSize: 12,} }}
                            
                            sx={{ 
                                width:1, 
                                ":hover":{
                                   backgroundColor: INPUT_BACKGROUND_HOVER_COLOR,
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        border: 'solid 1px',
                                        borderRadius:0,
                                    },
                                },
                               
                            }}
                        />
                        </Box>
                        
                        </>
                        }
                    </Box>
            ))}
             
        </Box>
       
        
       
    </Box>
  )
}