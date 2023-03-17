import React from 'react';
import {
    TableContainer,
    Table, TableHead,
    TableRow,
    TableCell,
    TableBody,
    Input,
    Checkbox,
    Tooltip,
    IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { BALLOT_TYPE1_ANSWERS } from '../../../utils/constantes';
import { 
    TEXT_COLOR,
    INPUT_LABEL_BACKGROUND_COLOR
} from '../../../utils/colors';

/**
 * @notice The form of a ballot type 1.
 * @param {*} props 
 * @returns 
 */
export default function BallotType1Form(props) {
    const {
        handleEditAnswer,
        disabled,
        answersPerBallot,
        handleCheckboxChangeBallotType1,
        restructure, 
        isEditable, 
        title, 
        handleChangeTitle } = props;

  return (
    <TableContainer sx={{
        border: 'solid 1px #CCCCCC', 
        borderBottom: 'none', 
        marginTop: 0}}>
        <Table>
            <TableHead>
                <TableRow sx={{ borderBottom: 'solid 1px', borderColor: INPUT_LABEL_BACKGROUND_COLOR}} >
                    <TableCell width={10} sx={{ borderRight: 'solid 1px', borderColor: INPUT_LABEL_BACKGROUND_COLOR }}> 
                        
                    </TableCell>
                    <TableCell align='left' >
                    <Input 
                        placeholder='Titel eintragen' 
                        disabled={!isEditable}
                        value={title} 
                        onChange={handleChangeTitle} 
                        disableUnderline 
                        sx={{ 
                            color: TEXT_COLOR, 
                            width: 1, 
                            fontSize: 12,
                            "& .MuiInputBase-input.Mui-disabled": {
                                WebkitTextFillColor: TEXT_COLOR
                            }
                            
                         }}
                    />
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {BALLOT_TYPE1_ANSWERS.map(option => (
                    <TableRow key={option} sx={{ borderBottom: 'solid 1px', borderColor: INPUT_LABEL_BACKGROUND_COLOR}}>
                        <TableCell sx={{borderRight: 'solid 1px', borderColor: INPUT_LABEL_BACKGROUND_COLOR}}>
                            {restructure &&
                                <Checkbox onChange={() => handleCheckboxChangeBallotType1(option)} checked={answersPerBallot[option]} disabled={disabled? disabled: false} />
                            }
                            
                        </TableCell>
                        <TableCell align='left' sx={{ color: TEXT_COLOR, fontSize: 12}}>{option}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
  )
}

/*
 {disabled &&
                            <Tooltip title='Antwort bearbeiten' style={{color: 'blue',}} >
                                <IconButton size='large' onClick={handleEditAnswer}>
                                    <EditIcon sx={{fontSize: 20}}/>
                                </IconButton>
                            </Tooltip>
                        }
 */