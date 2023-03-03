import {
    useState,
} from 'react';
import BallotType2Form from './BallotType2Form';

/**
 * @notice This component is used to display a election type with several candidates.
 * @param {*} props 
 * @returns 
 */
export default function BallotType2(props) {
    
    const [selectedCandidate, setSelectedCandidate] = useState(0);
    const {
        isEditable, 
        selectedIndex, 
        ballots, 
        ballots_to_add,
        whichBallots,
        setBallots,
        setBallots_to_add,
        selectedBallot,
        setBallotsToUpdate,
    } = props;

    const candidates = [...selectedBallot.candidates];
    const title = selectedBallot.title;

    const updateBallots = () => {
        if (!whichBallots || whichBallots === 'old') {
            setBallots([...ballots]);
            setBallotsToUpdate();
        }
        else if (whichBallots === 'new') {
            setBallots_to_add([...ballots_to_add]);
        } 
    }

    const handleChangeTitle = (event) => {
        selectedBallot.title = event.target.value;
        updateBallots();
    }

    const handleAddCandidate = () => {
        selectedBallot.candidates = [...selectedBallot.candidates, ''];
        setSelectedCandidate(candidates.length);
        updateBallots();
        
    }

    const handleRenameCandidate = (event) => {
        candidates[selectedCandidate] = event.target.value;
        selectedBallot.candidates = candidates;
        updateBallots();
   
    }

    const handleDeleteCandidate = () => {
        try {
        if (candidates.length > 1) {
            candidates.splice(selectedCandidate, 1);
            selectedBallot.candidates = candidates;
            if (selectedCandidate === candidates.length) {
                setSelectedCandidate(selectedCandidate - 1);
            }
            updateBallots();  
        }
        } catch (error) {
            console.error(error); 
        }
    }


  return (
   <BallotType2Form
    isEditable={isEditable}
    title={title}
    selectedCandidate={selectedCandidate}
    setSelectedCandidate={setSelectedCandidate}
    candidates={candidates}
    handleChangeTitle={handleChangeTitle}
    handleAddCandidate={handleAddCandidate}
    handleRenameCandidate={handleRenameCandidate}
    handleDeleteCandidate={handleDeleteCandidate}
    />
  )
}
