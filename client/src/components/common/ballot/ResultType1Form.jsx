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
export default function ResultType1Form(props) {
    const {
        selectedIndex,
     } = props;

     const votes = [
        [8, 4, 1],
        [7, 3, 3],
        [10, 9, 1],
        [4, 7, 2]
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
                                {BALLOT_TYPE1_ANSWERS.map((option, idx) => (
                                    <TableRow key={option} sx={{ borderBottom: 'solid 1px', borderColor: INPUT_LABEL_BACKGROUND_COLOR}}>
                                        <TableCell align='left' sx={{
                                            color: TEXT_COLOR, 
                                            fontSize: 12, 
                                            borderRight: 'solid 1px', 
                                            borderColor: INPUT_LABEL_BACKGROUND_COLOR
                                            }}>
                                            {option}
                                        </TableCell>
                                        <TableCell sx={{
                                            color: TEXT_COLOR, 
                                            fontSize: 12,
                                            }} >
                                            {votes[selectedIndex][idx]}
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