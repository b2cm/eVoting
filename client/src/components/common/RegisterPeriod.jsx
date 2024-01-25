import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    IconButton,
    Button,
    LinearProgress,
    Typography,
    InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MyDateTimePicker from './MyDateTimePicker';
import dayjs from 'dayjs';

import { useEth, actions } from '../../contexts/EthContext';
import DoneIcon from '@mui/icons-material/Done';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { green } from '@mui/material/colors';

export default function RegisterPeriod ({ openDialog, handleCloseDialog,}) {
    const { state, dispatch } = useEth();
    const { l2Contracts, signer } = state;
    const [registrationStart, setregistrationStart] = useState(dayjs().add(1, 'hour'));
    const [registrationEnd, setRegistrationEnd] = useState(registrationStart.add(1, 'day'));
    const [progress, setProgress] = useState(0);
    const [buffer, setBuffer] = useState(10);
    const [message, setMessage] = useState('');

    const handleSetRegisterPeriod = async () => {
        setMessage('');
        if (registrationStart.isBefore(registrationEnd)) {
            setProgress(10);
            setBuffer(60);
            const register = l2Contracts.Register
            const admin = await register.isRegistrationOpen();
            console.log('admin', admin)
            const start = registrationStart.unix();
            const end = registrationEnd.unix();
            setProgress(60);
            setBuffer(100);
            try {
                const tx = await register.connect(signer).setRegistrationPeriod(start, end);
                const receipt = await tx.wait();
                setProgress(100);
                setMessage('Status: ' + 'Einstellung gespeichert.')
                console.log(receipt);
                setProgress(0);
            } catch (error) {
                console.error(error.reason);
                setMessage('Status: ' + error.reason);
                setProgress(0);
                setBuffer(10);
            }
           
        }
    }
    console.log('l2', l2Contracts.Register);
  
  return (
    <Dialog 
        open={openDialog} 
        fullWidth 
        maxWidth={'md'} 
        sx={{ '& .MuiDialog-paper': { 
            width: '80%', 
            height: 400 
        } }}
    >
        <DialogActions>
            <Box sx={{ display: 'flex', justifyContent: 'end'}}>
                <IconButton size='small' onClick={() => {
                    setMessage('')
                    handleCloseDialog()
                    }}>
                    <CloseIcon sx={{fontSize: 30}}/>
                </IconButton>
            </Box>
        </DialogActions>
        <DialogTitle sx={{ fontSize: 20, textAlign: 'center'}}>
            Registrierungszeitraum einstellen
        </DialogTitle>
        <DialogContent width={'50%'} >
            <Box 
                
                display='flex' 
                flexDirection='column' 
                alignItems='center' 
                paddingTop={2} 
            >
                <MyDateTimePicker isEditable={true} value={registrationStart} setValue={setregistrationStart} label={'Start'} />
                <span style={{marginBottom: 20}} />
                <MyDateTimePicker isEditable={true} value={registrationEnd} setValue={setRegistrationEnd} label={'Ende'} />
                <span style={{marginBottom: 20}} />
                <Button
                    disabled={registrationEnd.isBefore(registrationStart)} 
                    variant='contained' 
                    size='large'
                    onClick={() => handleSetRegisterPeriod()}
                >
                    Speichern
                </Button>

                <span style={{marginBottom: 30}} />
               
            </Box>
            {(progress > 0) && 
                <Box sx={{ display: 'flex', alignItems: 'center',  }}>
                    <Box sx={{ width: '100%', mr: 1,  }}>
                        <LinearProgress variant='buffer' value={progress} valueBuffer={buffer} />
                    </Box>
                    <Box sx={{ minWidth: 35, }}>
                        <Typography variant="h5" color="text.secondary">{`${Math.round(progress)}%`}</Typography>
                    </Box>
                </Box>
            }

            {(message !== '') &&
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center',  }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row',  }}>
                        <Typography component='p' variant="h5" color="text.secondary">
                            {message}
                        </Typography>
                        {(message === 'Status: '+ 'Einstellung gespeichert.') &&
                            <DoneIcon 
                                sx={{
                                    fontSize: 25,
                                    color: green[700],
                                        
                                }}
                            />
                        }
                       
                    </Box>
                    
                </Box>
            }
      
        </DialogContent>

    
    
    </Dialog>
  )
}