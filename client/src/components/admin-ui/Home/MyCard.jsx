import React, {
    useState
} from 'react';
import {
    Card,
    CardContent,
    Typography,
    CardActionArea,
    CardActions,
    Box,
    IconButton
} from '@mui/material';
import { VOTING_STATES,
    DATE_FORMAT_OPTIONS
 } from '../../../utils/constantes';
import { getElectionStateColor } from '../../../utils/utils';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import Notification from '../../common/Notification';

export default function MyCard(props) {
    const { voteID, voteName, voteDescription, voteState, createdAt, voteStartTime, voteEndTime } = props.data;
    const [openSettings, setOpenSettings] = useState(false);
    const voteStartLocalDateTime = new Date(voteStartTime*1000).toLocaleString('de-DE', DATE_FORMAT_OPTIONS);
    const voteEndLocalDateTime = new Date(voteEndTime*1000).toLocaleString('de-DE', DATE_FORMAT_OPTIONS);
    const createAtLocalDateTime = new Date(createdAt*1000).toLocaleString('de-DE', DATE_FORMAT_OPTIONS);
    
    const navigate = useNavigate();

    const handleClick = () => {
        const data = JSON.stringify(props.data);
        navigate(`/admin/vote/cockpit/${voteID.slice(2)}`, { state: data });
    }
    const handleClickSettings = () => {
        setOpenSettings(prev => !prev);
    }

  return (
    <>
        <Card sx={{
        //width: 350, 
        //height: 230,
        //marginBottom: 1 
        }}  >
        <CardActionArea onClick={handleClick} sx={{
            
          }}>
            <CardContent>
                <Typography gutterBottom variant='body4' fontSize={16} fontWeight='bold' component='div' >{voteName}</Typography>
                <Typography gutterBottom variant='body3' component='div' sx={{marginBottom: 2, }}>{voteDescription}</Typography>
                
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
                        fontSize: '1em',
                        textAlign: 'center'
                    }}
                >
                    {voteState}
                </Typography>

                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                
                }}>
                    <Box sx={{
                        marginRight: 2,   
                    }}>
                        <Typography gutterBottom fontSize={12} fontWeight='bold' component='p' >
                            Erstellt: 
                        </Typography>
                        <Typography gutterBottom fontSize={12} fontWeight='bold' component='p' >
                            Start:
                        </Typography>
                        <Typography fontSize={12} fontWeight='bold' component='p' > 
                            Ende:
                        </Typography>
                    </Box>

                    <Box>
                        <Typography gutterBottom fontSize={12} component='p' >
                            {createAtLocalDateTime}
                        </Typography>
                        <Typography gutterBottom fontSize={12} component='p' >
                            {voteStartLocalDateTime}
                        </Typography>
                        <Typography fontSize={12} component='p' > 
                            {voteEndLocalDateTime}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </CardActionArea>
        <CardActions sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'end',
        }}>
            <IconButton onClick={handleClickSettings}>
                <SettingsIcon />
            </IconButton>
        </CardActions>
    </Card>

    {(openSettings) && <Notification setOpen={handleClickSettings} />}
    </>
    
  )
}
