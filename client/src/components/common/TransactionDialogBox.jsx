import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    IconButton,
    LinearProgress,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const TransactionDialogBox = ({ openDialog, handleCloseDialog, waitingMessage, progress, buffer}) => {
  return (
    <Dialog open={openDialog} fullWidth maxWidth={'md'} 
    sx={{ '& .MuiDialog-paper': { 
        width: '80%', 
        height: 200 
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
        textAlign: 'center'
        }}>
            {waitingMessage}
    </DialogTitle>
    <DialogContent sx={{paddingTop: 10}}>
        <Box sx={{ display: 'flex', alignItems: 'center',  }}>
            <Box sx={{ width: '100%', mr: 1,  }}>
                <LinearProgress variant='buffer' value={progress} valueBuffer={buffer} />
            </Box>
            <Box sx={{ minWidth: 35, }}>
                <Typography variant="h5" color="text.secondary">{`${Math.round(progress)}%`}</Typography>
            </Box>
        </Box>
   
    </DialogContent>
   
</Dialog>
  )
}
