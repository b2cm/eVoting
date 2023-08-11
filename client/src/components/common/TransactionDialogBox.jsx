import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    IconButton,
    LinearProgress,
    Typography, 
    Button,
} from '@mui/material';
import {
    grey,
    blue,
    teal,
} from '@mui/material/colors';
import CloseIcon from '@mui/icons-material/Close';


export const TransactionDialogBox = ({ handleLogout, handleCloseOverview, openDialog, handleCloseDialog, waitingMessage, progress, buffer}) => {

  return (
    <Dialog open={openDialog} fullWidth maxWidth={'md'} 
        sx={{ '& .MuiDialog-paper': { 
            width: '80%', 
            height:{xs: '40%', sm: '40%', md: '40%', lg: '40%', xl: '40%'} 
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
        marginTop: 1,
        marginBottom:2,
        fontSize: 20,
        textAlign: 'center'
        }}>
            {waitingMessage.length === 1? waitingMessage[0]: 
            waitingMessage.length === 2 ?
            <Box>
                <p>{waitingMessage[0]}</p>
                <p>{waitingMessage[1]}</p>
            </Box> :
            <Box>
            <p>{waitingMessage[0]}</p>
            <p>{waitingMessage[1]}</p>
            <p>{waitingMessage[2]}</p>
        </Box>
            }
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
        {(handleCloseOverview && handleLogout && progress === 100) && 
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <Button  
                    color='error'
                    variant='contained' 
                    size='large' 
                    sx={{
                        mr: 5,
                        width: 1/3,
                        fontSize: 12,
                        
                    }} 
                    onClick={handleLogout}
                >
                    Abmelden
                </Button>
                <Button 
                    variant='contained' 
                    size='large' 
                    onClick={() => handleCloseOverview(0, true)}
                    sx={{
                        width: 1/3,
                        fontSize: 12,
                       
                    }}
                >
                    Erneut abstimmen
                </Button>
            </Box>
        }
   
    </DialogContent>
   
</Dialog>
  )
}

/*
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
*/
