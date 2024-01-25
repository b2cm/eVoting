import React, {
    useState,
} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    IconButton,
    LinearProgress,
    Typography,
    Checkbox, 
    Button
} from '@mui/material';
import {
    grey,
    blue,
    teal,
} from '@mui/material/colors';
import CloseIcon from '@mui/icons-material/Close';

export const AcceptAGB = ({ openDialog, handleCloseDialog, handleLogin}) => {
    const [AGBaccepted, setAGBaccepted] = useState(false);
    const message = 'Hiermit bestätige ich, dass ich die Hinweise zur Kenntnis genommen habe.';

  return (
    <Dialog open={openDialog} fullWidth maxWidth={'md'} 
    sx={{ '& .MuiDialog-paper': { 
        width: '80%', 
        height: 400 
    } }}
 >
    <DialogActions>
    <Box sx={{
        display: 'flex',
        justifyContent: 'end'
    }}>
        <IconButton size='small' onClick={handleCloseDialog}>
            <CloseIcon sx={{
                fontSize: 30
            }}/>
        </IconButton>
    </Box>
    </DialogActions>
    <DialogTitle sx={{
        fontSize: 20,
        //textAlign: 'center'
        }}>
            Hinweise
    </DialogTitle>
    <DialogContent>
        <Box height={150}>
            <Typography variant="h5" color="text.secondary">1-</Typography>
            <Typography variant="h5" color="text.secondary">2-</Typography>
            <Typography variant="h5" color="text.secondary">3-</Typography>
            <Typography variant="h5" color="text.secondary">4-</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start' }}>
            <Box sx={{ border: '1opx blue'}} >
                <Checkbox onChange={() => setAGBaccepted(prevValue => !prevValue)} checked={AGBaccepted}/>
            </Box>
            <Box>
                <Typography variant="h5" color="text.secondary">{message}</Typography>
            </Box>
        </Box>
        <Button
                variant='contained'
                size='large'
                onClick={() => {
                    //handleCloseDialog()
                    handleLogin()
                }}
                disabled={!AGBaccepted}
                sx={{
                    width: 1,
                    fontSize: 12,
                    backgroundColor: teal[500],
                    ":hover": {
                            backgroundColor: teal[700]
                    }
                }}
            >
                    Anmelden
            </Button>
   
    </DialogContent>
   
</Dialog>
  )
}