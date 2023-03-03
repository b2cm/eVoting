import { useEffect, useState, useMemo } from 'react';
import { 
    Box,
    IconButton,
    ClickAwayListener,
    MenuList,
    MenuItem,
    Popper,
    Paper,
    Tooltip,
 } from '@mui/material';
 import AddIcon from '@mui/icons-material/Add';
 import DeleteIcon from '@mui/icons-material/Delete';
 import FileCopyIcon from '@mui/icons-material/FileCopy';
import SearchField from '../../common/SearchField';
import { ICON_COLOR } from '../../../utils/colors';


export default function BallotPanelActions(props) {

    const { 
        selectedIndex, 
        setSelectedIndex, 
        whichBallots, 
        setWhichBallots,
        setBallots,
        ballots,  
        isEditable, 
        ballots_to_add, 
        ballots_to_delete,
        ballots_to_update,
        setBallots_to_add,
        setBallots_to_delete,
        setBallots_to_update,
     } = props;

    const ballotsCopy = [...ballots];
    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
      setOpen((previousOpen) => !previousOpen);
    };

    const handleClose = (event) => {
        if (anchorEl.current && anchorEl.current.contains(event.target)) {
          return;
        }
    
        setOpen(false);
      };



    const Ballot = (ballotType, name, information, title, candidates) => {
        candidates.push('');
        return ballotType === 1 ? 
            {ballotType, name, information, title, candidates: Array(0)} : 
            {ballotType, name, information, title, candidates};
    }


    const createNewBallot = (ballotType) => {
        const newBallot = Ballot(ballotType, '', '',  '', []);
        if (whichBallots) { // We are in the vote cockpit component
            setBallots_to_add(prevBallots => [newBallot,...prevBallots]);
            setWhichBallots('new');
        } else {
            setBallots(prevBallots => [newBallot,...prevBallots]);
        }
        setSelectedIndex(0);
        handleClose();
    }

    const handleDeleteBallot = () => {
        try {
            if (!whichBallots) {
                if (ballots.length > 1) {
                    ballots.splice(selectedIndex, 1);
                    setBallots([...ballots]);
                    setSelectedIndex(0);
                }
            }
            else if (whichBallots === 'new') {
                if (ballots_to_add.length + ballots.length > 1) {
                    ballots_to_add.splice(selectedIndex, 1);
                    //ballots_to_delete.push(selectedIndex);
                    setBallots_to_add([...ballots_to_add]);
                    if (ballots_to_add.length === 0) {
                        setSelectedIndex(0);
                        setWhichBallots('old');
                    }else if (selectedIndex === ballots_to_add.length) {
                        setSelectedIndex(ballots_to_add.length - 1);
                        //setBallotType(ballots[ballots.length - 1].type);
                    }
                }
            } else if (whichBallots === 'old') {
                if (ballots.length + ballots_to_add.length > 1) {
                    // Get the ballot index from the initial ballot array
                    const indexBallotToRemove = ballotsCopy.indexOf(ballots[selectedIndex]);
                    if (indexBallotToRemove !== -1) {
                        ballots.splice(selectedIndex, 1);
                        ballots_to_delete.push(indexBallotToRemove);
                        // Check if an updated ballot need to be removed
                        for (let i = 0; i < ballots_to_delete.length; i++) {
                            const index = ballots_to_update.findIndex(item => item.index === ballots_to_delete[i]);
                            console.log('index to remove', index);
                            if (index !== -1) {
                                ballots_to_update.splice(index, 1);
                            }
                        }
                        setBallots([...ballots]);
                        setBallots_to_delete([...ballots_to_delete]);
                        setBallots_to_update([...ballots_to_update]);
                    }
                    
                    if (ballots.length === 0) {
                        setSelectedIndex(ballots_to_add.length - 1);
                        setWhichBallots('new');
                        
                    }
                }
            }
            if (selectedIndex === ballots.length && ballots.length !== 0) {
                setSelectedIndex(ballots.length - 1);
            }
        } catch (error) {
            console.error(error);
        }
            
    }

    const allBallotsLength = useMemo(() => {
        return ballots_to_add ? ballots.length + ballots_to_add.length : ballots.length;
    }, [ballots_to_add, ballots]);

    
    const popperProps = {
        sx: {
        "& .MuiTooltip-tooltip": {
            width: 150,
            height: 20,
            textAlign: 'center',
            backgroundColor: '#002D67'
        }
        }
    };


  return (
    
        <Box sx={{ 
            marginRight: 4,
            width: 500,
            //border: 'solid red'
         }}>
            <Box sx={{
                display:'flex',
                flexDirection:'row',
                justifyContent:'start',
                paddingBottom: 0,
                paddingTop: 0,
                marginTop: 1.5,
                
            }}>
                <Tooltip disableHoverListener={!isEditable} title={<h1 style={{color: 'white', fontSize: 12, fontWeight: 400, textAlign: 'center' }}>Stimmzettel hinzufügen</h1>} placement='top' arrow PopperProps={popperProps} > 
                    <span>
                    <IconButton disabled={!isEditable} onClick={handleClick} sx={{ width: 32, height: 32, borderRadius: 0 }}>
                        <AddIcon sx={{ width: 25, height: 25, color: ICON_COLOR, }} /> 
                    </IconButton>
                    </span>
                    
                </Tooltip>

                <Popper 
                    open={open}
                    anchorEl={anchorEl}
                >
                    <Paper>
                    <ClickAwayListener onClickAway={handleClose}>
                        <MenuList  >
                            <MenuItem onClick={() => createNewBallot(1)} sx={{fontSize: 12}}>
                                Abstimmung
                            </MenuItem>
                            <MenuItem onClick={() => createNewBallot(2)} sx={{fontSize: 12}}>
                                Kandidatenwahl
                            </MenuItem>
                        </MenuList>
                    </ClickAwayListener>
                    </Paper>  
                </Popper>

                <Tooltip 
                    disableHoverListener={!isEditable} 
                    title={<h1 style={{color: 'white', fontSize: 12, fontWeight: 400, textAlign: 'center' }}>Stimmzettel löschen</h1>} placement='top' arrow PopperProps={popperProps}>
                    <span>
                    <IconButton 
                    disabled={!(isEditable && allBallotsLength > 1)} 
                    onClick={handleDeleteBallot} 
                    sx={{ width: 32, height: 32, color: ICON_COLOR, borderRadius: 0 }}>
                        <DeleteIcon sx={{width: 25, height: 25, color: ICON_COLOR }}/>
                    </IconButton>
                    </span>
                </Tooltip>

                <Tooltip disableHoverListener={!isEditable} title={<h1 style={{color: 'white', fontSize: 12, fontWeight: 400, textAlign: 'center' }}>Stimmzettel kopieren</h1>} placement='top' arrow PopperProps={popperProps}>
                    <span>
                    <IconButton disabled={!isEditable}  sx={{ width: 32, height: 32, color: ICON_COLOR, borderRadius: 0 }}>
                        <FileCopyIcon sx={{width: 25, height: 25, color: ICON_COLOR }} />
                    </IconButton>
                    </span>
                </Tooltip>
                
            </Box>
            <Box sx={{marginTop: 1,}}>
                <SearchField fullWidth={true}/>
            </Box>
            
          
        </Box>
        


  )
}
