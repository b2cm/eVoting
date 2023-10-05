import React, {
    useState,
} from 'react';
import {
    Box,

} from '@mui/material';
import BallotPaperLeftComponent  from './BallotPaperLeftComponent';
import BallotPaperRightComponent from './BallotPaperRightComponent';

export default function BallotPanel(props) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { 
        ballots, 
        setBallots, 
        isEditable,
        ballots_to_add,
        setBallots_to_add,
        ballots_to_delete,
        setBallots_to_delete,
        ballots_to_update,
        setBallots_to_update,
        whichBallots,
        setWhichBallots,
    } = props;
   
  return (

        <Box 
        sx={{
            
            height: '66.5vh', //643,
            display: 'flex',
            flexDirection: 'row',
            
        }}>
            <BallotPaperLeftComponent 
                selectedIndex={selectedIndex} 
                setSelectedIndex={setSelectedIndex} 
                ballots={ballots}
                setBallots={setBallots} 
                isEditable={isEditable}
                ballots_to_add={ballots_to_add}
                setBallots_to_add={setBallots_to_add}
                ballots_to_delete={ballots_to_delete}
                setBallots_to_delete={setBallots_to_delete}
                ballots_to_update={ballots_to_update}
                setBallots_to_update={setBallots_to_update}
                whichBallots={whichBallots}
                setWhichBallots={setWhichBallots}
            />
            <BallotPaperRightComponent 
                selectedIndex={selectedIndex} 
                ballots={ballots} 
                setBallots={setBallots} 
                isEditable={isEditable}
                ballots_to_add={ballots_to_add}
                setBallots_to_add={setBallots_to_add}
                ballots_to_delete={ballots_to_delete}
                setBallots_to_delete={setBallots_to_delete}
                ballots_to_update={ballots_to_update}
                setBallots_to_update={setBallots_to_update}
                whichBallots={whichBallots}
                setWhichBallots={setWhichBallots}
            />
        </Box>
    
  )
}
