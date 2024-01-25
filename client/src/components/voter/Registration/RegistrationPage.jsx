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
//import Popup from '../../common/Popup';
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
import axios from 'axios';
import { switchNetwork } from '../../../utils/utils';



export default function RegistrationPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [waitingMessage, setWaitingMessage] = useState(['']);
    const [progress, setProgress] = useState(0);
    const [buffer, setBuffer] = useState(10);
    const { state, dispatch } = useEth();
    const { contracts, l2Contracts, signer, l2Provider, chainId, paymaster } = state;
    const [voterID, setVoterID] = useState(null);
    const [keyPair, setKeyPair] = useState(null);
    const [openPopup, setOpenPopup] = useState(false);
    const [showDownloadButton, setShowDownloadButton] = useState(false);
    const [credentials, setCredentials] = useState(null);
    const items = ['Email', 'Passwort'];
    const registerMessagPart1 = `Um sich auf unserer Voting-Plattform zu registrieren,`;
    const registerMessagePart2 = 'geben Sie bitte Ihre E-Mail-Adresse und Ihr Passwort ein.';
    const registerMessagePart3 = 'Nach erfolgreicher Registrierung erhalten Sie Ihre Zugangsdaten als Datei, die Sie sorgfältig aufbewahren sollen.'
    const BACKEND_URL = 'http://localhost:3100' //'http://bccm-s7.hs-mittweida.de:3100';

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

    const saveCredentialsAsFile = (filename, dataObjToWrite) => {
        const blob = new Blob([JSON.stringify(dataObjToWrite)], { type: "text/json" });
        const link = document.createElement("a");
    
        link.download = filename;
        link.href = window.URL.createObjectURL(blob);
        link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");
    
        const evt = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
        });
    
        link.dispatchEvent(evt);
        link.remove()
    };

    function downloadJSON(data, filename) {
        const json = JSON.stringify(data);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
      
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
      
        URL.revokeObjectURL(url);
      }


    const sendPKToBackend = async (pk, hash) => {
        let { data } = await axios.post(BACKEND_URL + "/Vote/Voter", {
            pubKey: pk,
      });
      await axios.post(BACKEND_URL + "/Vote/HashedId", {
        pubKey: pk,
        hashedId: hash,
      });
      console.log('datata', data);
    };

    const pk = "1307044742500590418140288027357228832938025207712114840182014119921440597876421527504826906399638179439335530048637432644803168808855744253947868441637140877621457929965566872422675544449709002550945142791040042869192467315110479387"
    const handleClickRegisterButton = async() => {
        setOpenDialog(true);
        setWaitingMessage(['Registrierung wird durchgeführt'])
        setProgress(40);
        setBuffer(60);

        const register = l2Contracts.Register;
        const isOpen = await register.isRegistrationOpen();
        console.log('is open', isOpen);
        const sha512 = createHash('sha512');
        const voterID = sha512.update(email + password).digest('hex');
        let hashedID = '0x' + (poseidon(['0x' + voterID])).toString();
        console.log('hashed voter', ethers.BigNumber.from(hashedID));
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
        const pk_hex = ethers.utils.hexlify(ethers.BigNumber.from(publicKey));
        const hash_id = ethers.utils.hexlify(ethers.BigNumber.from(hashedID));
        console.log('pk hexlify', pk_hex);
        const pk_num = ethers.BigNumber.from(pk_hex).toString();
        console.log('pk string', pk_num);
        console.log(publicKey === pk_num);
        
        const gasPrice = await l2Provider.getGasPrice();
        console.log('gas price', gasPrice);
         // Encoding the ApprovalBased paymaster flow's input
        const paymasterParams = utils.getPaymasterParams(paymaster, {
            type: 'General',
            innerInput: new Uint8Array(),
        });
        const gasLimit = await register.connect(signer).estimateGas.storeVoterData(
            hash_id,
            pk_hex,
            
            {
                customData: {
                    gasPerPubData: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
                    paymasterParams
                },
            }
            
        );
        
        //console.log('fee', ethers.utils.formatEther(gasPrice * gasLimit));
        //setWaitingMessage('Zugangsdaten werden generiert.');
        setProgress(60);
        setBuffer(100);

        const txHandle = await register.connect(signer).storeVoterData(
            hash_id,
            pk_hex,
            
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
                setKeyPair({publicKey: lrsKeypair.publicKey.toString(16), privateKey: lrsKeypair.privateKey.toString(16)});
                //setOpenDialog(false);
                //sendPKToBackend(publicKey);
                const message0 = 'Registrierung erfolgreich.';
                const message1 = 'Zugangsdaten heruntergeladen.'
                const message2 = 'Sie können dieses Fenster schließen'
                setWaitingMessage([message0, message1, message2]);
                setEmail('');
                setPassword('');
                const credentials =  {
                    id: voterID,
                    pk: lrsKeypair.publicKey.toString(16),
                    sk: lrsKeypair.privateKey.toString(16)
                };
                sendPKToBackend(lrsKeypair.publicKey.toString(16), hashedID);
                saveCredentialsAsFile('credentials.json', credentials);
                //downloadJSON(credentials, 'credentials.json');
                //setCredentials(credentials);
                //setShowDownloadButton(true);
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
                            width: '30%', 
                            //height:35, 
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
        if (chainId !== '0x118') switchNetwork('zksync');
       // if (signer) getNonce();
          
    }, [signer]);

    function download(data) {
        const json = JSON.stringify(data);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
      
        const link = document.createElement('a');
        link.href = url;
        link.download = 'credentials.json';
        link.textContent = 'Click here to download the JSON file';
        
        const container = document.createElement('div');
        container.appendChild(link);
      
        // Insert the container into the document (e.g., using document.body)
        // Or show it in a modal or any other way you prefer
      
        URL.revokeObjectURL(url);
      }

  
  return (
    
    <Container 
        sx={{
            //height: '80%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10,
        }}
    >
        
            

            {!chainId &&
                <Typography variant='h4' textAlign='center'>
                    Please wait...
                </Typography> 
            }    
            {chainId && 
                <Box 
                sx={{
                    width:{xs: '100%', sm: '90%', md: '80%', lg: '60%', xl: '60%'},
                }}>
                <Typography 
                    component='div' 
                    variant='h5' 
                    align='center' 
                    sx={{
                    marginBottom: 10,
                    pt: 2,
                    pb: 2,
                    //border: 'solid 1px white',
                    backgroundColor: blue[500],
                    color: grey[200]
                   
                }}>
                    <InputAdornment position='start' sx={{
                        marginRight:0
                    }} >
                        <InfoIcon sx={{
                            fontSize:{xs: 25, sm: 20, md: 30, lg: 30, xl: 30},
                            color: grey[200],
                            mt: 1,
                            ml:1,
                           
                            }} />
                    </InputAdornment>
                   {registerMessagPart1} <br /> {registerMessagePart2} <br /> {registerMessagePart3}
                </Typography>

                <Box>
                    {generateItems()}
                </Box>
                
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

                {showDownloadButton && 
                    <Button
                    variant='contained'
                    size='large'
                    onClick={download(credentials)}
                    sx={{
                        width: 1,
                        fontSize: 12,
                        backgroundColor: teal[500],
                        ":hover": {
                            backgroundColor: teal[700]
                        }
                    }}
                >
                   Zugangsdaten herunterladen
                </Button>
                }
            </Box>
            }            
                

        <TransactionDialogBox openDialog={openDialog} handleCloseDialog={handleCloseDialog} waitingMessage={waitingMessage} progress={progress} buffer={buffer} />
    </Container>

    

  )
}

