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
    const { voteName, voteDescription, state, createAt, voteStartTime, voteEndTime } = props;
    const voteStartLocalDateTime = new Date(voteStartTime*1000).toLocaleString('de-DE', DATE_FORMAT_OPTIONS);
    const voteEndLocalDateTime = new Date(voteEndTime*1000).toLocaleString('de-DE', DATE_FORMAT_OPTIONS);
    const createAtLocalDateTime = new Date(createAt*1000).toLocaleString('de-DE', DATE_FORMAT_OPTIONS);
   

  return (
    <Card sx={{
        //width: 350, 
        //height: 230,
        marginBottom: 2 }}  >
        <CardActionArea sx={{  }}>
            <CardContent>
                <Typography gutterBottom fontSize={17} component='div' >{voteName}</Typography>
                <Typography gutterBottom variant='body3' component='div' sx={{height: 40, }}>{voteDescription}</Typography>
                
                <Input 
                    disabled
                    disableUnderline
                    size='small'
                    style={{ 
                        width: 200,
                        border:'solid', 
                        borderWidth: '2px',
                        borderColor: getElectionStateColor(state),
                        borderRadius: '0.30rem', 
                        marginTop: '0rem',
                        marginBottom: '1.5rem'
                    }}
                    inputProps={{ style:{ WebkitTextFillColor: getElectionStateColor(state), fontSize: '1.2em', fontWeight: 600, textAlign: 'center'}}}
                    value={state}
                />
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                
                }}>
                    <Box sx={{
                        marginRight: 2,   
                    }}>
                        <Typography gutterBottom fontSize={12} fontWeight={600} component='p' >
                            Erstellt: 
                        </Typography>
                        <Typography gutterBottom fontSize={12} fontWeight={600} component='p' >
                            Start:
                        </Typography>
                        <Typography fontSize={12} fontWeight={600} component='p' > 
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
