import React from 'react';
import {
    TableContainer,
    Table, TableHead,
    TableRow,
    TableCell,
    TableBody,
    Input,
} from '@mui/material';
import { BALLOT_TYPE1_ANSWERS } from '../../../utils/constantes';

/**
 * @notice The form of a ballot type 1.
 * @param {*} props 
 * @returns 
 */
export default function BallotType1Form(props) {
    const {isEditable, title, handleChangeTitle } = props;

  return (
    <TableContainer sx={{
        //width: 400, 
        border: 'solid 1px #CCCCCC', 
        borderBottom: 'none', 
        marginTop: 0}}>
        <Table  sx={{}}>
            <TableHead>
                <TableRow sx={{
                    //height: 30,
                    //border: 'solid 1px #CCCCCC',
                    borderBottom: 'solid 1px #CCCCCC',
                }}
                    >
                    <TableCell sx={{
                        width: 12, 
                        borderRight: 'solid 1px #CCCCCC', 
                        }}>
                        
                    </TableCell>
                    <TableCell align='right' sx={{textAlign: 'left', }}>
                    <Input placeholder='Titel eintragen' 
                    disabled={!isEditable}
                    value={title} 
                    onChange={handleChangeTitle} 
                    disableUnderline sx={{ width: 1, fontSize: 12,}}/>
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {BALLOT_TYPE1_ANSWERS.map(option => (
                    <TableRow key={option} sx={{
                        borderBottom: 'solid 1px #CCCCCC'
                        }}>
                        <TableCell sx={{
                            borderRight: 'solid 1px #CCCCCC'
                            }}>
                        </TableCell>
                        <TableCell align='right' sx={{textAlign: 'left', fontSize: 12}}>{option}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
  )
}