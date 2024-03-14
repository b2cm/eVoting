import { 
    useState,
    useEffect
 } from 'react';
import { 
    Box,
    List,
    ListItemText,
    ListItemIcon,
    ListItemButton,
    Divider,
 } from '@mui/material';
 import BallotIcon from '@mui/icons-material/Ballot';
import BallotPanelActions from './BallotPanelActions';
import { ICON_COLOR } from '../../../utils/colors';



export default function BallotPaperLeftComponent(props) {
    
    const { 
        showActionButtons,
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

    const handleClickBallot = (index, which) => {
        setSelectedIndex(index);
        if(setWhichBallots) {
            setWhichBallots(which);
        }
    }

    const renderBallotAsButton = (index, ballot, which ) => {
        return (
            <ListItemButton key={index} 
                    selected={ !whichBallots || whichBallots === which ? selectedIndex === index : false} 
                    onClick={() => handleClickBallot(index, which)}
                    sx={{ 
                        border: 'solid 1px #CCCCCC',  
                        borderRadius: '0px',
                        marginBottom: 1, 
                    }}>
                    <ListItemIcon style={{ minWidth: '30px'}} >
                        <BallotIcon sx={{ width: 20, height: 20, color: ICON_COLOR}}/>
                    </ListItemIcon>
                    <ListItemText 
                        disableTypography sx={{ 
                        marginLeft: 0,
                        width: 1,
                        overflowX: 'hidden',
                        fontSize: 12,
                        fontWeight: 530,
                        color: 'grey'}} >
                        {ballot.name === '' ? 'Unbenannt' : ballot.name}
                    </ListItemText>
                </ListItemButton>
        )
    }


  return (
    
        <Box sx={{ 
            marginRight: 4,
            width: 500,
            //border: 'solid red'
         }}>
            { 
                <BallotPanelActions
                showActionButtons={showActionButtons}
                selectedIndex={selectedIndex} 
                setSelectedIndex={setSelectedIndex}
                whichBallots={whichBallots} 
                setWhichBallots={setWhichBallots}
                ballots={ballots}
                setBallots={setBallots}
                isEditable={isEditable}
                ballots_to_add={ballots_to_add}
                ballots_to_delete={ballots_to_delete}
                ballots_to_update={ballots_to_update}
                setBallots_to_add={setBallots_to_add}
                setBallots_to_delete={setBallots_to_delete}
                setBallots_to_update={setBallots_to_update}

            />
            }
            
          <List style={{maxHeight: 500 , overflow: 'scroll'}} 
          sx={{marginTop: 2,}}>
            {whichBallots && 
                <>
                    { ballots_to_add.map((ballot, index) => (
                        renderBallotAsButton(index, ballot, 'new')
                    ))}
                    <Divider light 
                        sx={{
                            fontWeight: 30,
                            marginBottom: 1,
                        }} 
                    />
                </>
            }
            { ballots.map((ballot, index) => (
               renderBallotAsButton(index, ballot, 'old')
            ))}
          </List>
          
        </Box>
        


  )
}
