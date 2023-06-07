import {
    useState,
    useEffect,
} from 'react';
import BallotType2Form from './BallotType2Form';

/**
 * @notice This component is used to display a election type with several candidates.
 * @param {*} props 
 * @returns 
 */
export default function BallotType2(props) {
    
    const [selectedCandidate, setSelectedCandidate] = useState(0);
    const [countSelectedYESAnswers, setCountSelectedYesAnswers] = useState(0);
    const {
        answersPerBallot,
        handleCheckboxChangeBallotType2,
        restructure, // This is used to display checkboxes within the voter UI.
        isEditable, // This is used to determine if the ballot is editable or not. Ballots are editable if the vote is in preparation.
        disabled, // This property is used to disable the checkboxes when rendering the control overview component.
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
    const maxSelectableAnswer = selectedBallot.maxSelectableAnswer;
    //console.log('data', answersPerBallot);

    const updateBallots = () => {
        if (!whichBallots || whichBallots === 'old') {
            setBallots([...ballots]);
            setBallotsToUpdate();
        }
        else if (whichBallots === 'new') {
            setBallots_to_add([...ballots_to_add]);
        } 
    }

    const handleChangeMaxSelectableAnswer = (event) => {
        //console.log('max', event.target.value);
        selectedBallot.maxSelectableAnswer = event.target.value;
        updateBallots();
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

    const handleMaxSelectedYESAnswers = () => {
        if (restructure && disabled && !isEditable) {

        }
    }

    useEffect(() => {
        if (answersPerBallot) {
            let count = 0;
            for (let i = 0; i < answersPerBallot.length; i ++) {
                if (answersPerBallot[i].answers.JA && count < maxSelectableAnswer) {
                    count += 1;
                }
            }
            setCountSelectedYesAnswers(count);
            }    
    });


  return (
   <BallotType2Form
        disabled={disabled}
        answersPerBallot={answersPerBallot}
        handleCheckboxChangeBallotType2={handleCheckboxChangeBallotType2}
        restructure={restructure}
        isEditable={isEditable}
        title={title}
        maxSelectableAnswer={maxSelectableAnswer}
        countSelectedYESAnswers={countSelectedYESAnswers}
        handleChangeMaxSelectableAnswer={handleChangeMaxSelectableAnswer}
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
