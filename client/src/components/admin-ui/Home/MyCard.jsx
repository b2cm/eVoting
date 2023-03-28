import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    CardActionArea,
    Input,
    Box,
} from '@mui/material';
import { VOTING_STATES,
    DATE_FORMAT_OPTIONS
 } from '../../../utils/constantes';
import { getElectionStateColor } from '../../../utils/utils';

export default function MyCard(props) {
    const { voteName, voteDescription, state, createdAt, voteStartTime, voteEndTime } = props;
    const voteStartLocalDateTime = new Date(voteStartTime*1000).toLocaleString('de-DE', DATE_FORMAT_OPTIONS);
    const voteEndLocalDateTime = new Date(voteEndTime*1000).toLocaleString('de-DE', DATE_FORMAT_OPTIONS);
    const createAtLocalDateTime = new Date(createdAt*1000).toLocaleString('de-DE', DATE_FORMAT_OPTIONS);
   

  return (
    <Card sx={{
        //width: 350, 
        //height: 230,
        //marginBottom: 1 
        }}  >
        <CardActionArea sx={{  }}>
            <CardContent>
                <Typography gutterBottom variant='body4' fontSize={16} fontWeight='bold' component='div' >{voteName}</Typography>
                <Typography gutterBottom variant='body3' component='div' sx={{marginBottom: 2, }}>{voteDescription}</Typography>
                
                <Typography 
                    sx={{ 
                        width: 200,
                        border:'solid', 
                        borderWidth: '2px',
                        color: getElectionStateColor(state),
                        borderColor: getElectionStateColor(state),
                        borderRadius: '0.30rem', 
                        marginTop: '0rem',
                        marginBottom: '1.5rem',
                        fontWeight: 'bold',
                        fontSize: '1em',
                        textAlign: 'center'
                    }}
                >
                    {state}
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
    </Card>
  )
}
