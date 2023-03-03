import React from 'react';
import {
    Box,
    Input,
    Card,
    CardContent,
} from '@mui/material';
import BallotType1 from './BallotType1';
import BallotType2 from './BallotType2';


export const BallotPaperRightComponent = (props) => {

    const { 
        ballots,  
        setBallots,
        isEditable, 
        ballots_to_add, 
        ballots_to_delete,
        ballots_to_update,
        setBallots_to_add,
        setBallots_to_delete,
        setBallots_to_update,
        selectedIndex, 
        setSelectedIndex, 
        whichBallots, 
        setWhichBallots
    } = props;

    const selectedBallot = whichBallots ? 
        whichBallots === 'new' ? ballots_to_add[selectedIndex] : ballots[selectedIndex] : ballots[selectedIndex];
      
    const name = selectedBallot.name;
    const description = selectedBallot.information;
    const ballotType = selectedBallot.ballotType;

   const setBallotsToUpdate = () => {
        if (whichBallots === 'old') {
            const to_update = {index: selectedIndex, ballot_paper: selectedBallot}
            const indexSelectedBallot = ballots_to_update.findIndex(item => item.index === selectedIndex);
            if (indexSelectedBallot === -1) {
                setBallots_to_update([...ballots_to_update, to_update]);
            } else {
                ballots_to_update[indexSelectedBallot] = to_update;
                setBallots_to_update([...ballots_to_update]);
            }
        }
   }

    const handleChangeName = (event) => {
        selectedBallot.name = event.target.value;
        setBallots([...ballots]);
        setBallotsToUpdate();
    }

    const handleChangeDescription = (event) => {
        selectedBallot.information = event.target.value;
        setBallots([...ballots]);
        setBallotsToUpdate();
    }

  return (
   
    <Box sx={{
        width: 1,
        display: 'flex', 
        flexDirection: 'column', 
        //justifyContent: 'center', 
        alignItems: 'center', 
        //height: 1, 
        backgroundColor:'#FAFAFA', 
        borderLeft:'solid 1px #CCCCCC', 
        //flexGrow: 8,
        }}>

        <Card sx={{
            maxHeight: 550,
            overflow: 'scroll',
            marginTop: 7.5,
            width: 1.9/2
            }}>
                <CardContent>
                    <Input placeholder='Unbenannter Stimmzettel' value={name} onChange={handleChangeName} autoFocus disableUnderline sx={{width: 1, fontSize: 12, marginBottom: 1}}/>
                    <Input placeholder='Information über Stimmzettel eintragen' value={description} onChange={handleChangeDescription} disableUnderline sx={{ width: 1, fontSize:12, marginBottom: 2}}/>
                    {
                        <>
                        {ballotType === 1 && 
                            <BallotType1 
                                selectedBallot={selectedBallot} 
                                isEditable={isEditable}
                                setBallots={setBallots}
                                setBallots_to_add={setBallots_to_add}
                                whichBallots={whichBallots} 
                                ballots={ballots} 
                                ballots_to_add={ballots_to_add}
                                setBallotsToUpdate={setBallotsToUpdate}
                            />
                        }
                        {ballotType === 2 && 
                            <BallotType2 
                                selectedBallot={selectedBallot}  
                                selectedIndex={selectedIndex}
                                isEditable={isEditable}
                                setBallots={setBallots}
                                setBallots_to_add={setBallots_to_add}
                                whichBallots={whichBallots} 
                                ballots={ballots} 
                                ballots_to_add={ballots_to_add}
                                setBallotsToUpdate={setBallotsToUpdate}
                            />
                        }
                        </>
                    }
                </CardContent>
        </Card>
    </Box>
  )
}