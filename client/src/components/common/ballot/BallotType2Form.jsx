import React, {

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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * @dev The form of a ballot type 2.
 * @param {*} props 
 * @returns 
 */
export default function BallotType2Form(props) {
    const { 
        isEditable,
        selectedCandidate,
        setSelectedCandidate,
        candidates, 
        title,
        handleAddCandidate, 
        handleDeleteCandidate, 
        handleRenameCandidate, 
        handleChangeTitle } = props;

//const candidates = [ '1', '2', '3', '4', '5', '6', '7', '8'];

  return (
    <TableContainer 
            sx={{
                width: 1, 
                border: 'solid 1px #CCCCCC', 
                borderBottom: 'none', 
                //marginTop: 10
            }}>
        <Table  sx={{}}>
            <TableHead>
                <TableRow sx={{
                        borderBottom: 'solid 1px #CCCCCC',
                    }}>
                    <TableCell sx={{
                            width: 0, 
                            borderRight: 'solid 1px #CCCCCC', 
                        }}>
                        {isEditable && 
                            <Tooltip title='Kandidaten hinzufügen'>
                            <span>
                            <IconButton disabled={!isEditable} size='small' onClick={handleAddCandidate} >
                            <AddIcon sx={{
                                color: 'black',
                                fontSize: 20
                            }}/>
                        </IconButton>
                            </span>
                        </Tooltip>
                        }
                    </TableCell>
                    <TableCell align='right' sx={{textAlign: 'left', }}>
                    <Input 
                    disabled={!isEditable}
                    placeholder='Titel eintragen' 
                    value={title} onChange={handleChangeTitle} 
                    disableUnderline sx={{ width: 1, fontSize: 12,}}/>
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {candidates.map((candidate, index) => (
                    <TableRow key={index} sx={{borderBottom: 'solid 1px #CCCCCC'}}>
                        <TableCell sx={{
                            width: 15,
                            borderRight: 'solid 1px #CCCCCC'}}>
                            {selectedCandidate===index &&
                                <>
                                {isEditable &&
                                    <Tooltip title='Kandidaten löschen'>
                                    <span>
                                    <IconButton size='small' disabled={candidates.length === 1 || !isEditable} onClick={handleDeleteCandidate}>
                                    <DeleteIcon sx={{
                                        //fontSize: 20
                                        }}/>
                                </IconButton>
                                    </span>
                                </Tooltip>
                                }
                                </>
                            }
                        </TableCell>
                        <TableCell align='right' sx={{textAlign: 'left', fontSize: 12}}>
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
                                    fontSize: 12, 
                                    //backgroundColor: inputBackgroundColor,
                                    ":hover":{
                                       // backgroundColor: inputBackgroundColorHover,
                                    },
                                    "& label.Mui-focused": {
                                        color: 'green'
                                      },
                                }}/>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
  )
}