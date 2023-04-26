import React, {
    useState,
    Fragment,
} from 'react';
import {
    TableContainer,
    Table, TableHead,
    TableRow,
    TableCell,
    TableBody,
    Input,
    IconButton,
    Tooltip,
    Checkbox,
    Typography,
    Box,
    FormGroup,
    FormControlLabel,
    Popper,
    Paper, 
    MenuItem,
    MenuList,
    ClickAwayListener,
    TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { BALLOT_TYPE1_ANSWERS } from '../../../utils/constantes';
import { 
    TEXT_COLOR,
    INPUT_LABEL_BACKGROUND_COLOR,
    ICON_COLOR,
    BORDER_COLOR
 } from '../../../utils/colors';

/**
 * @dev The form of a ballot type 2.
 * @param {*} props 
 * @returns 
 */
export default function BallotType2Form(props) {
    const {
        disabled, 
        answersPerBallot,
        handleCheckboxChangeBallotType2,
        restructure,
        isEditable,
        selectedCandidate,
        setSelectedCandidate,
        candidates, 
        title,
        maxSelectableAnswer,
        handleChangeMaxSelectableAnswer,
        handleAddCandidate, 
        handleDeleteCandidate, 
        handleRenameCandidate, 
        handleChangeTitle 
    } = props;

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

    const handleNewLine = (event) => {
        handleClose(event);
        handleAddCandidate();
    }


  return (
    <>
    <TableContainer 
            sx={{
                width: 1, 
                border: 'solid',
                borderWidth: '1px', 
                borderColor: INPUT_LABEL_BACKGROUND_COLOR,
                borderBottom: 'none', 
                //marginTop: 10
            }}>
        <Table  sx={{}}>
            <TableHead>
                <TableRow sx={{
                        borderBottom: 'solid',
                        borderWidth: '1px', 
                        borderColor: INPUT_LABEL_BACKGROUND_COLOR,
                    }}>
                    {!restructure && 
                        <>
                            <TableCell sx={{ 
                                width: 12,
                                borderRight: 'solid',
                                borderWidth: '1px', 
                                borderColor: INPUT_LABEL_BACKGROUND_COLOR,
                                }} >
                                {isEditable &&
                                <>
                                    <Tooltip title='Kandidaten hinzufügen'>
                                        <span>
                                            <IconButton disabled={!isEditable} size='small' onClick={handleAddCandidate} >
                                                <AddIcon sx={{ color: ICON_COLOR, fontSize: 20 }}/>
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    
                                </> 
                                }
                            </TableCell>

                            <TableCell align='left' >
                                <TextField 
                                    variant='standard'
                                    InputProps={{
                                        disableUnderline: true,
                                        style: {
                                            color: TEXT_COLOR,
                                            fontSize: 12
                                        }
                                    }}
                                    size='small'
                                    disabled={!isEditable}
                                    placeholder='Titel eintragen' 
                                    value={title} 
                                    onChange={handleChangeTitle} 
                                    //disableUnderline 
                                    //sx={{ color: TEXT_COLOR, width: 1, fontSize: 30, }}
                                />
                            </TableCell>
                        </>
                    }

                    {restructure && 
                        <>
                            <TableCell align='left' width={400} >
                                <Typography variant='h6' color={TEXT_COLOR} >{title}</Typography>
                            </TableCell>
                        </>
                        
                    }   
                    
                </TableRow>
                
            </TableHead>
            <TableBody>
                {candidates.map((candidate, index) => (
                    <TableRow key={index} sx={{
                        borderBottom: 'solid',
                        borderWidth: '1px', 
                        borderColor: INPUT_LABEL_BACKGROUND_COLOR,
                    }}>
                        {!restructure && 
                        <>
                            <TableCell sx={{
                                width: 12,
                                borderRight: 'solid',
                                borderWidth: '1px', 
                                borderColor: INPUT_LABEL_BACKGROUND_COLOR,
                                }}>
                                {selectedCandidate===index &&
                                    <>
                                    {isEditable &&
                                        <Tooltip title='Kandidaten löschen'>
                                            <span>
                                                <IconButton size='small' disabled={candidates.length === 1 || !isEditable} onClick={handleDeleteCandidate}>
                                                    <DeleteIcon sx={{
                                                        color: ICON_COLOR,
                                                        //fontSize: 20
                                                        }}
                                                    />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    }
                                    </>
                                }
                            </TableCell>
                            <TableCell align='left' sx={{ fontSize: 12}}>
                                <TextField
                                    variant='standard'
                                    InputProps={{
                                        disableUnderline: true,
                                        style: {
                                            color: TEXT_COLOR,
                                            fontSize: 12
                                        }
                                    }}
                                    size='small'
                                    disabled={!isEditable}
                                    placeholder='Name des Kandidaten eintragen'
                                    value={candidate} 
                                    onSelect={(event) => {
                                        setSelectedCandidate(index);
                                    }} 
                                    //autoFocus 
                                    onChange={handleRenameCandidate} 
                                    inputRef={input => {
                                        //console.log('input', input);
                                        //input?.focus(); // === input && input.focus()
                                    }} 
                                    fullWidth 
                                    //disableUnderline 
                                    
                                    sx={{ 
                                        color: TEXT_COLOR,
                                        fontSize: 12, 
                                        borderWidth: 0,
                                        //backgroundColor: inputBackgroundColor,
                                        ":hover":{
                                        // backgroundColor: inputBackgroundColorHover,
                                        },
                                        "& label.Mui-focused": {
                                            color: 'green'
                                        },
                                    }}
                                />
                            </TableCell>
                        </>
                        }

                        {restructure && 
                            <>
                                <TableCell align='left' sx={{ fontSize: 12, borderRight: 'solid 1px #CCCCCC'}}>
                                    <Typography variant='h6' color={TEXT_COLOR}>
                                        {candidate}
                                    </Typography>
                                </TableCell>

                                <TableCell align='left' sx={{ fontSize: 12}}> 
                                    <Box sx={{ display: 'flex', alignItems: 'center'}}>
                                            {BALLOT_TYPE1_ANSWERS.map((option, index2) => (
                                                <FormGroup key={index2}>
                                                    <FormControlLabel control={<Checkbox onChange={() => handleCheckboxChangeBallotType2(candidate, option)} checked={answersPerBallot[index].answers[option]} disabled={disabled? disabled: false}/>} label={option} />
                                                </FormGroup>
                                            ))}
                                    </Box>
                                </TableCell>
                            </>
                        }
                        
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
    <Box display='flex' marginTop={2} >
        
        <TextField 
            disabled={!isEditable}
            variant='outlined' 
            type='number' 
            label='Max JA Stimmen' 
            value={maxSelectableAnswer}
            onChange={handleChangeMaxSelectableAnswer}
            helperText='Maximale Anzahl an JA Stimmen'
            InputProps={{
                inputProps: { 
                    max: candidates.length, 
                    min: 1 
                }
            }}
        />
    </Box>
    </>
  )
}

/*
<Popper 
                                        open={open}
                                        anchorEl={anchorEl}
                                    >
                                        <Paper>
                                            <ClickAwayListener onClickAway={handleClose}>
                                                <MenuList  >
                                                    <MenuItem sx={{fontSize: 12}}>
                                                        Max Stimme einstellen
                                                    </MenuItem>
                                                    <MenuItem onClick={handleNewLine} sx={{fontSize: 12}}>
                                                        Neue Zeile hinzufügen
                                                    </MenuItem>
                                                </MenuList>
                                            </ClickAwayListener>
                                        </Paper>  
                                    </Popper>

*/