import { 
    Box,
    TextField,
    Input } from '@mui/material';
import { getElectionStateColor } from '../../utils/utils';
import { INPUT_BACKGROUND_HOVER_COLOR } from '../../utils/colors';



export default function VoteDetails(props) {
    const {
        voteName,
        voteDescription,
        voteState,
        setVoteName,
        setVoteDescription,
    } = props;

    const handleSetVoteName = event => {
        const newName = event.target.value;
        setVoteName(newName);
    }
    
    const handleSetVoteDescription = event => {
        const description = event.target.value;
        setVoteDescription(description);
    }
   
  return (
    <Box sx={{ 
            
        display: 'flex',
        flexDirection: 'column',
        marginTop:2,
        marginBottom:2,
        }}
    >
        <Box sx={{ 
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 0,
            }}>
            <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 3,
            marginBottom: 0,
            }}>
                <TextField
                    variant='standard'
                    size='large'
                    style={{ 
                        maxWidth: 600, 
                    }}
                    placeholder='Unbenanntes Voting'
                    value={voteName}
                    onChange={handleSetVoteName}
                    InputProps={{ disableUnderline: true, style: { 
                        fontSize: '20px', 
                        fontWeight: 550, 
                        fontFamily: 'Arial',
                        fontStyle: 'normal',
                        letterSpacing: 0.5
                    } }}
                    sx={{
                    
                    ":hover":{
                        backgroundColor: INPUT_BACKGROUND_HOVER_COLOR
                    }
                    }}
                />
                <TextField
                    variant='standard'
                    style={{
                        maxWidth: 600
                    }}
                    InputProps={{ disableUnderline: true, style: { fontSize:12 } }}
                    placeholder='Beschreibung'
                    value={voteDescription}
                    onChange={handleSetVoteDescription}
                    multiline
                    maxRows={3}
                    sx={{
                        ":hover":{
                        backgroundColor: INPUT_BACKGROUND_HOVER_COLOR
                        },
                        ":focus": {
                            backgroundColor: INPUT_BACKGROUND_HOVER_COLOR
                        }
                    }}    
                />
            </Box>
    
            <Box>
                <Input 
                    disabled
                    disableUnderline
                    size='small'
                    style={{ 
                        width: 200,
                        border:'solid 2px',
                        borderColor: getElectionStateColor(voteState), 
                        borderRadius: '0.30rem', 
                    }}
                    //InputProps={{ disableUnderline: true, style: { color:'blue !important' ,borderColor:'red', } }}
                    inputProps={{ style:{ WebkitTextFillColor: getElectionStateColor(voteState), fontSize: '1.2em', fontWeight: 550, textAlign: 'center'}}}
                    defaultValue={voteState}
                />
            </Box>
        </Box>
    </Box>   
  )
}