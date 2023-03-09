import React from 'react';
import {
    Container,
    Box,
    Card,
    CardContent,
    Typography,
    Tooltip,
    Button,
    CardActions,
    List,
    ListItem,
    
} from '@mui/material';
import BallotType1 from '../../common/ballot/BallotType1';
import BallotType2 from '../../common/ballot/BallotType2';
import { 
    ELECTION_IN_PREPARATION_COLOR,
    INPUT_LABEL_BACKGROUND_COLOR,
    SUCCESS_COLOR,
    SUCCESS_COLOR_HOVER
 } from '../../../utils/colors';

export default function ControlOverview(props) {
    const { ballots, answersPerBallot, handleCloseOverview } = props;
    console.log('answers', answersPerBallot);

  return (
    <Container sx={{
        height: '74vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', 
        //overflowY: 'auto',
        //border: 'solid',
        borderWidth: '1px',
        borderColor: INPUT_LABEL_BACKGROUND_COLOR,
        paddingBottom: 2,
        paddingTop: 2,
        marginTop: 0,
        }}>
            <Typography variant='h4' component='p'>Kontrollübersicht</Typography>
            <List style={{maxHeight: '100vh', overflow: 'scroll', width: '80%', marginTop: 5}} >
            {ballots.map((ballot, index) => {
                return (
                    <ListItem key={index} >
                        <Card variant='outlined' sx={{ width: 1 }}>
                        <CardContent sx={{ maxHeight: 500, overflow: 'scroll',}} >
                            <Typography variant='h5' gutterBottom marginBottom={1} >{ballot.name}</Typography>
                            
                            {ballot.ballotType === 1 &&
                                <BallotType1 answersPerBallot={answersPerBallot[index].option} restructure={true} disabled={true} selectedBallot={ballot} />
                            }
                            {ballot.ballotType === 2 &&
                                <BallotType2 answersPerBallot={answersPerBallot[index].options} restructure={true} disabled={true} selectedBallot={ballot} />
                            }
                        </CardContent>
                        <CardActions>
                            <Button variant='contained' 
                                onClick={() => handleCloseOverview(index)}
                                sx={{
                                    fontSize: 10,
                                    //fontWeight: 'bold',
                                    //backgroundColor: ELECTION_IN_PREPARATION_COLOR
                                }}
                            >
                                Antwort bearbeiten
                            </Button>
                        </CardActions>
                    </Card>
                    </ListItem>
                )
                })
            }
            </List>
            <Tooltip>
                <Button variant='contained' size='large' fullWidth
                sx={{
                    width: '80%',
                    marginTop: 4,
                    fontSize: 12,
                    //fontWeight: 'bold',
                    backgroundColor: SUCCESS_COLOR,
                    ":hover": {
                        backgroundColor: SUCCESS_COLOR_HOVER
                    }
                }}
                >
                    Verbindlich abstimmen
                </Button>
            </Tooltip>
    </Container>
  )
}


