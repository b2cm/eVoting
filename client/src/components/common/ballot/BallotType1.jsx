import BallotType1Form from './BallotType1Form';

/**
 * @notice This component is used to display a election type with tree possible answers.
 * @param {*} props 
 * @returns 
 */
export default function BallotType1(props) {
    
    const { 
        handleEditAnswer,
        answersPerBallot,
        handleCheckboxChangeBallotType1,
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
        handleEditAnswer={handleEditAnswer}
        disabled={disabled}
        answersPerBallot={answersPerBallot}
        handleCheckboxChangeBallotType1={handleCheckboxChangeBallotType1}
        restructure={restructure}
        title={title}
        isEditable={isEditable}
        handleChangeTitle={handleChangeTitle}
    />
    )
}
