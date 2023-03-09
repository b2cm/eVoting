import React, {
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
        answersPerBallot,
        handleCheckboxChangeBallotType2,
        restructure,
        isEditable,
        selectedCandidate,
        setSelectedCandidate,
        candidates, 
        title,
        handleAddCandidate, 
        handleDeleteCandidate, 
        handleRenameCandidate, 
        handleChangeTitle 
    } = props;

  return (
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
                                    <Tooltip title='Kandidaten hinzufügen'>
                                        <span>
                                            <IconButton disabled={!isEditable} size='small' onClick={handleAddCandidate} >
                                                <AddIcon sx={{ color: ICON_COLOR, fontSize: 20 }}/>
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                }
                            </TableCell>

                            <TableCell align='left' >
                                <Input 
                                    disabled={!isEditable}
                                    placeholder='Titel eintragen' 
                                    value={title} 
                                    onChange={handleChangeTitle} 
                                    disableUnderline 
                                    sx={{ color: TEXT_COLOR, width: 1, fontSize: 12, }}
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
                                borderRigth: 'solid',
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
                                <Input 
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
                                    disableUnderline 
                                    
                                    sx={{ 
                                        color: TEXT_COLOR,
                                        fontSize: 12, 
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
                                                    <FormControlLabel control={<Checkbox onChange={() => handleCheckboxChangeBallotType2(candidate, option)} checked={answersPerBallot[index].answers[option]} />} label={option} />
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
  )
}
/*
<Fragment key={index}>
                                                    <Checkbox label={option} />
                                                    <Typography variant='h6' color={TEXT_COLOR} >{option}</Typography>
                                                </Fragment>
*/