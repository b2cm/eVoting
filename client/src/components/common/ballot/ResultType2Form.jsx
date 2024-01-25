import React from 'react';
import {
    TableContainer,
    Table, TableHead,
    TableRow,
    TableCell,
    TableBody,
    Card,
    CardContent,
    Box
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
export default function ResultType2Form(props) {
    const {
        handleEditAnswer,
        disabled,
        answersPerBallot,
        handleCheckboxChangeBallotType1,
        restructure, 
        isEditable, 
        title, 
        handleChangeTitle } = props;

    const candidates = [
        {name: 'Kandidat 1', vote: [6, 5, 2]},
        {name: 'Kandidatin 2', vote: [10, 2, 1]},
        {name: 'Kandidat 3', vote: [6, 7, 0]},
        {name: 'Kandidatin 4', vote: [8, 2, 3]}
    ]
  return (
    <Box sx={{
        width: 1,
        display: 'flex', 
        flexDirection: 'column', 
        //justifyContent: 'center', 
        alignItems: 'center', 
        //height: 1, 
        backgroundColor:'#FAFAFA', 
        borderLeft:'solid 1px #CCCCCC', 
        //flexGrow: 8,
        }}>
          <Card sx={{
            maxHeight: 550,
            overflow: 'scroll',
            marginTop: 7.5,
            width: 1.9/2
            }}>
                <CardContent>
                    <TableContainer sx={{
                    border: 'solid 1px #CCCCCC', 
                    borderBottom: 'none', 
                    marginTop: 0}}>
                        <Table>
                            <TableBody>
                                {candidates.map(option => (
                                    <TableRow key={option} sx={{ borderBottom: 'solid 1px', borderColor: INPUT_LABEL_BACKGROUND_COLOR}}>
                                        <TableCell align='left' sx={{
                                            color: TEXT_COLOR, 
                                            fontSize: 12, borderRight: 'solid 1px', 
                                            borderColor: INPUT_LABEL_BACKGROUND_COLOR
                                            }}>{option.name}
                                        </TableCell>
                                        <TableCell >
                                            {BALLOT_TYPE1_ANSWERS.map((answer, idx) => (
                                                <TableRow key={answer} sx={{ border: 'solid 1px', borderColor: INPUT_LABEL_BACKGROUND_COLOR}}>
                                                    <TableCell align='left' sx={{
                                                    color: TEXT_COLOR, 
                                                    fontSize: 12,
                                                    borderRight: 'solid 1px', 
                                                    borderColor: INPUT_LABEL_BACKGROUND_COLOR
                                                    }}>
                                                    {answer}
                                                </TableCell>
                                                <TableCell sx={{ 
                                                    width: 1,
                                                    color: TEXT_COLOR, 
                                                    fontSize: 12, }}>
                                                    {option.vote[idx]}
                                                </TableCell>
                                                </TableRow>
                                                
                                            ))}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
    </Box>
  )
}