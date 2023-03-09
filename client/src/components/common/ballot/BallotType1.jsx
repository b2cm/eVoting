import BallotType1Form from './BallotType1Form';

/**
 * @notice This component is used to display a election type with tree possible answers.
 * @param {*} props 
 * @returns 
 */
export default function BallotType1(props) {
    
    const { 
        answersPerBallot,
        handleCheckboxChangeBallotType1,
        restructure,
        isEditable, 
        ballots,
        ballots_to_add,
        whichBallots,
        setBallots,
        setBallots_to_add,
        selectedBallot,
        setBallotsToUpdate,
        
         } = props;
    
    const title = selectedBallot.title;


    const handleChangeTitle = (event) => {
        selectedBallot.title = event.target.value;
        if (!whichBallots || whichBallots === 'old') {
            setBallots([...ballots]);
            setBallotsToUpdate();
        }
        else if (whichBallots === 'new') {
            console.log(ballots_to_add);
            setBallots_to_add([...ballots_to_add]);
        }  
    }

  return (
    <BallotType1Form
        answersPerBallot={answersPerBallot}
        handleCheckboxChangeBallotType1={handleCheckboxChangeBallotType1}
        restructure={restructure}
        title={title}
        isEditable={isEditable}
        handleChangeTitle={handleChangeTitle}
    />
    )
}
