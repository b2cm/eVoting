import { useState, useEffect } from 'react';
import { useEth,  } from '../../../contexts/EthContext';
import { utils } from "zksync-web3";
import { poseidon } from '@big-whale-labs/poseidon';
import { createHash } from 'crypto';
import {
    Container,
    Box,
    Button,
    Input,
    IconButton,
    InputAdornment,
    Typography,
    Tooltip,
} from '@mui/material';
import {
    grey,
    teal,
    blue,
} from '@mui/material/colors';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InfoIcon from '@mui/icons-material/Info';
import Popup from '../../common/Popup';
import { ethers } from 'ethers';
import { TransactionDialogBox } from '../../common/TransactionDialogBox';
import {
    TEXT_COLOR,
    BORDER_COLOR,
    INPUT_BACKGROUND_HOVER_COLOR,
    INPUT_LABEL_BACKGROUND_COLOR,
    INPUT_BACKGROUND_COLOR
} from '../../../utils/colors';
import { generatePair } from '../../../cryptography/lrs';



export default function RegistrationPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [waitingMessage, setWaitingMessage] = useState('Die Daten werden verarbeitet');
    const [progress, setProgress] = useState(0);
    const [buffer, setBuffer] = useState(10);
    const { state, dispatch } = useEth();
    const { contracts, l2Contracts, signer, l2Provider, chainId, paymaster } = state;
    const [voterID, setVoterID] = useState(null);
    const [keyPair, setKeyPair] = useState(null);
    const [openPopup, setOpenPopup] = useState(false);
    const items = ['Email', 'Passwort'];


    const handleCloseDialog = () => {
        setOpenDialog(false);     
    }

    const handleClosePopup = () => {
        setVoterID(null);
        setOpenPopup(false);
    }

    const handleClickShowPassword = () => setShowPassword(prevState => !prevState);

    const handleChangeEmail = event => {
        setEmail(event.target.value);
    }

    const handleChangePassword = event => {
        setPassword(event.target.value);
    }


    const handleClickRegisterButton = async() => {
        setOpenDialog(true);
        setProgress(40);
        setBuffer(60);

        const register = l2Contracts.Register;
        const sha512 = createHash('sha512');
        const voterID = sha512.update(email + password).digest('hex');
        let hashedID = '0x' + (poseidon(['0x' + voterID])).toString();
        console.log('hashed voter', hashedID);
        console.log('voter id',voterID);
        const lrsKeypair = generatePair();
        console.log('lrs keypair',lrsKeypair);
        /*
        const publicKey = '0x' + lrsKeypair.publicKey.toString();
        console.log('pk', publicKey);
        console.log('pk big number', ethers.BigNumber.from(publicKey));
        */
        const publicKey =  lrsKeypair.publicKey.toString();
        console.log('pk', publicKey);
        console.log('pk big number', ethers.BigNumber.from('0x' + publicKey));

        const gasPrice = await l2Provider.getGasPrice();
         // Encoding the ApprovalBased paymaster flow's input
        const paymasterParams = utils.getPaymasterParams(paymaster, {
            type: 'General',
            innerInput: new Uint8Array(),
        });
        const gasLimit = await register.connect(signer).estimateGas.storeHashedID(
            hashedID,
            //publicKey,

            {
                customData: {
                    gasPerPubData: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
                    paymasterParams
                },
            }
            
        );
        
        console.log('fee', ethers.utils.formatEther(gasPrice * gasLimit));
        setWaitingMessage('Zugangsdaten werden generiert.');
        setProgress(60);
        setBuffer(100);

        const txHandle = await register.connect(signer).storeHashedID(
            hashedID,
            //publicKey,
            
            {
                // Provide gas params manually
                maxFeePerGas: gasPrice,
                maxPriorityFeePerGas: gasPrice,
                gasLimit,
          
                // paymaster info
                customData: {
                  paymasterParams,
                  gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
                 },
              }
              
            );
        console.log('tx', txHandle);
        const receipt = await txHandle.wait();
        const events = receipt.events;
        console.log('receipt', receipt);
        events.forEach(e => {
            if (e.event === 'HashedIDStored') {
                console.log('event', e);
               // setWaitingMessage(`voter-ID: ${voterID} \n ` );
                setProgress(100);
                setVoterID(voterID);
                setKeyPair({publicKey: lrsKeypair.publicKey.toString(), privateKey: lrsKeypair.privateKey.toString()});
                setOpenPopup(true);
                setOpenDialog(false);
                setEmail('');
                setPassword('');
            }
        })
    
    }
            

    const generateItems = () => {
        return (
            items.map((e, index) => (
                <Box 
                key={index}
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    marginBottom:2,
                }}
                >
                    <Input 
                        disableUnderline
                        disabled
                        defaultValue={e}
                        size='normal'
                        inputProps={{ style: { WebkitTextFillColor: TEXT_COLOR, textAlign: 'center'} }}
                        sx={{ 
                            width:1/5, 
                            height:35, 
                            paddingLeft:1, 
                            border:'solid 1px', 
                            BORDER_COLOR: BORDER_COLOR,
                            fontSize: 15,
                            backgroundColor: INPUT_LABEL_BACKGROUND_COLOR,
                            
                        }} 
                    /> 
                    <Input 
                        required
                        disableUnderline 
                        size='normal'
                        type={index===1 ? showPassword ? 'text' : 'password' : 'text'}
                        endAdornment={index===1 && 
                        <InputAdornment position='end'>
                            <IconButton onClick={handleClickShowPassword} >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                        </InputAdornment>
                        }
                        value={index===0 ? email : password } 
                        onChange={index===0 ? handleChangeEmail : handleChangePassword} 
                        inputProps={{ style: { WebkitTextFillColor: TEXT_COLOR, } }}
                        sx={{ 
                            width:1, 
                            height:35, 
                            paddingLeft:1, 
                            border:'solid 1px',
                            BORDER_COLOR: BORDER_COLOR, 
                            borderLeft:'none', 
                            fontSize: 15, 
                            backgroundColor: INPUT_BACKGROUND_COLOR,
                            ":hover":{
                                backgroundColor: INPUT_BACKGROUND_HOVER_COLOR,
                            }
                        }}
                    />
                    
                </Box>
            ))
        );
    }

    useEffect(() => {
        const getNonce = async () => {
            const nonce = await signer.getNonce();
            const paymasterBalance = await l2Provider.getBalance(paymaster);
            console.log('account nonce', nonce);
            console.log('paymaster balance', ethers.utils.formatEther(paymasterBalance));
        }
        //if (chainId !== '0x118') switchNetwork('zksync);
        if (signer) getNonce();
          
    }, [signer]);

  
  return (
    <Box>
            <Container 
        sx={{
            height: '80%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10,
        }}
    >
        <Box
         sx={{
            width: '100%',
        }}
        >
            {openPopup && <Popup value={{
                voterID, 
                keyPair
                }} setOpen={handleClosePopup} />}
            {!chainId &&
                <Typography variant='h4' textAlign='center'>
                    Please wait.
                </Typography> 
            }    
            {chainId && 
                <Box>
                <Typography component='div' variant='h5' align='center' sx={{
                    marginBottom: 10,
                    pt: 2,
                    pb: 2,
                    border: 'solid 1px white',
                    backgroundColor: blue[500],
                    color: grey[200]
                   
                }}>
                    <InputAdornment position='start' >
                        <InfoIcon sx={{
                            fontSize: 30,
                            color: grey[200],
                            mt: 1,
                            ml:1,
                        }} />
                    </InputAdornment>
                    Geben Sie bitte Ihre Email-Adresse und Ihr Passwort an, um Sie registrieren zu können.
                    <br />
                    Sie erhalten dann Ihre Zugangsdaten, die Sie bitee sorgfällig aufbewahren sollten.
                </Typography>
                {generateItems()}
                <Tooltip 
                    title={<p style={{fontSize: 15}}>{signer ? 'Registrierung starten' : 'Wallet bitte verbinden'}</p>} 
                    placement='top' >
                    <span>
                    <Button
                        disabled={signer ? false : true}
                        variant='contained'
                        size='large'
                        onClick={handleClickRegisterButton}
                        sx={{
                            width: 1,
                            fontSize: 12,
                            backgroundColor: teal[500],
                            ":hover": {
                                backgroundColor: teal[700]
                            }
                        }}
                    >
                       Registrieren
                    </Button>
                    </span>
                </Tooltip>
            </Box>
            }            
               
        </Box> 
       
    </Container>
    <TransactionDialogBox openDialog={openDialog} handleCloseDialog={handleCloseDialog} waitingMessage={waitingMessage} progress={progress} buffer={buffer} />
    </Box>

  )
}