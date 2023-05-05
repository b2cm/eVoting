import { 
    Box,
    TextField,
    Input,
    Typography
 } from '@mui/material';
import { getElectionStateColor } from '../../utils/utils';
import { INPUT_BACKGROUND_HOVER_COLOR } from '../../utils/colors';



export default function VoteDetails(props) {
    const {
        isEditable,
        voteName,
        voteDescription,
        voteState,
        setVoteName,
        setVoteDescription,
    } = props;

    //const isEditable = voteState === VOTING_STATES[0] ? true : false;

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
        marginTop:2,
        display: 'flex',
        flexDirection: {xs: 'column', sm: 'column', md: 'row', lg: 'row', xl: 'row'},
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
                disabled={!isEditable}
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
            disabled={!isEditable}
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

        <Box sx={{
            marginTop: {xs: 1, sm: 1, md: 0, lg: 0, xl: 0} 
        }}>
            
            <Typography 
                    sx={{ 
                        width: 200,
                        border:'solid', 
                        borderWidth: '2px',
                        color: getElectionStateColor(voteState),
                        borderColor: getElectionStateColor(voteState),
                        borderRadius: '0.30rem', 
                        marginTop: '0rem',
                        marginBottom: '1.5rem',
                        fontWeight: 'bold',
                        fontSize: {xs: '1.2em', sm: '1.2em', md: '1.4em', lg: '1.4em', xl: '1.4em'},
                        textAlign: 'center'
                    }}
                >
                    {voteState}
                </Typography>
        </Box>
    </Box>  
  )
}