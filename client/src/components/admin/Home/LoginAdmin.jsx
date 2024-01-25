import { useState, useEffect, } from 'react';
import { useEth, actions, } from '../../../contexts/EthContext';
import { 
    Container,
    Box,
    InputAdornment,
    Typography,
    Input,
    Button,
    IconButton

} from '@mui/material';
import {
    grey,
    blue,
    teal,
} from '@mui/material/colors';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
    TEXT_COLOR,
    BORDER_COLOR,
    INPUT_BACKGROUND_HOVER_COLOR,
    INPUT_LABEL_BACKGROUND_COLOR,
    INPUT_BACKGROUND_COLOR
} from '../../../utils/colors';
import { Navigate, useNavigate } from 'react-router-dom';



export default function LoginAdmin() {
    const [voterID, setVoterID] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { state, dispatch } = useEth();
    const { chainId, l1Contracts, accounts, web3, signer, artifacts,  } = state;
    const navigate = useNavigate();
    
    
    const handleChangeUsername = event => {
        setUsername(event.target.value);
    }

    const handleClickShowPassword = () => setShowPassword(prevState => !prevState);

    const handleChangePassword = event => {
        setPassword(event.target.value);
    }

    const handleLogin = () => {
        if (username === 'admin' && password === 'admin') {
            dispatch({
                type: actions.init,
                data: { isAdminAuthenticated: true}
            })
            navigate('/admin/home', { state: { isAuthenticated: true}});
        }
        else {
            alert('wrong credentials');
        }
        
    }


  return (
    <Container
        sx={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 10,
        }}
    >
        <Box
            sx={{
                width: { xs: '100%', sm: '100%', lg:'50%'},
            }}
        >
            <Typography 
                component='div' 
                variant='h5' 
                align='center' 
                sx={{
                marginBottom: 10,
                pt: 2,
                pb: 2,
                border: 'solid 1px white',
                backgroundColor: blue[500],
                color: grey[200]
                }
            }>
                <InputAdornment position='start' >
                    <InfoIcon 
                        sx={{
                            fontSize: 30,
                            color: grey[200],
                            mt: 1,
                            ml:1,
                        }}
                    />
                </InputAdornment>
               Melden Sie sich bitte an.
            </Typography>

            <Box 
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    marginBottom:2,
                }}
            >
                <Input 
                    disableUnderline
                    disabled
                    defaultValue='Username'
                    size='normal'
                    inputProps={{ style: { WebkitTextFillColor: TEXT_COLOR, textAlign: 'center'} }}
                    sx={{ 
                        width: '30%', 
                        //height:35, 
                        paddingLeft:1, 
                        border:'solid 1px', 
                        borderColor: BORDER_COLOR,
                        fontSize: 15,
                        backgroundColor: INPUT_LABEL_BACKGROUND_COLOR,
                        
                    }} 
                /> 
                <Input 
                
                    required
                    disableUnderline 
                    size='normal'
                    type= 'text'
                    onChange={handleChangeUsername}
                    value={username} 
                    inputProps={{ style: { WebkitTextFillColor: TEXT_COLOR, } }}
                    sx={{ 
                        width:1, 
                        height:35, 
                        paddingLeft:1, 
                        border:'solid 1px',
                        borderColor: BORDER_COLOR, 
                        borderLeft:'none', 
                        fontSize: 15, 
                        backgroundColor: INPUT_BACKGROUND_COLOR,
                        ":hover":{
                            backgroundColor: INPUT_BACKGROUND_HOVER_COLOR,
                        }
                    }}
                />
            </Box>
            <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    marginBottom:2,
                }}>
                <Input 
                        disableUnderline
                        disabled
                        defaultValue='Passwort'
                        size='normal'
                        inputProps={{ style: { WebkitTextFillColor: TEXT_COLOR, textAlign: 'center'} }}
                        sx={{ 
                            width: '30%', 
                            height:35, 
                            paddingLeft:1, 
                            border:'solid 1px', 
                            borderColor: BORDER_COLOR,
                            fontSize: 15,
                            backgroundColor: INPUT_LABEL_BACKGROUND_COLOR,
                            
                        }} 
                /> 
                <Input 
                        required
                        disableUnderline 
                        size='normal'
                        type={!showPassword? 'password' : 'text'}
                        onChange={handleChangePassword}
                        value={password} 
                        inputProps={{ style: { WebkitTextFillColor: TEXT_COLOR, } }}
                        endAdornment={
                            <InputAdornment position='end'>
                                <IconButton onClick={handleClickShowPassword} >
                                    {!showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                            </InputAdornment>
                            }
                        sx={{ 
                            width:1, 
                            height:35, 
                            paddingLeft:1, 
                            border:'solid 1px',
                            borderColor: BORDER_COLOR, 
                            borderLeft:'none', 
                            fontSize: 15, 
                            backgroundColor: INPUT_BACKGROUND_COLOR,
                            ":hover":{
                                backgroundColor: INPUT_BACKGROUND_HOVER_COLOR,
                            }
                        }}
                />
            </Box>
        
            <Button
                variant='contained'
                size='large'
                onClick={handleLogin}
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
        </Box>
    </Container>
  )
}