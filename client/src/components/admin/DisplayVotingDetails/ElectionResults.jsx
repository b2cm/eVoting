import React, { useState } from 'react';
import Box from '@mui/material/Box';
import  BallotPaperLeftComponent  from '../../common/ballot/BallotPaperLeftComponent';
import  BallotPaperRightComponent from '../../common/ballot/BallotPaperRightComponent';
import ResultType1Form from '../../common/ballot/ResultType1Form';
import ResultType2Form from '../../common/ballot/ResultType2Form';

export default function ElectionResults(props) {
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
              showActionButtons={false}
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
          {selectedIndex !== 2 &&
            <ResultType1Form selectedIndex={selectedIndex} />
          }
          {selectedIndex === 2 &&
            <ResultType2Form />
          }
      </Box>
  
)
}
