import { useState, useEffect, } from 'react';
import { useEth, actions, } from '../../../contexts/EthContext';
import { 
    Container,
    Box,
    InputAdornment,
    Typography,
    Input,
    Button,

} from '@mui/material';
import {
    grey,
    blue,
    teal,
} from '@mui/material/colors';
import InfoIcon from '@mui/icons-material/Info';
import { initialize } from 'zokrates-js';
import { poseidon } from '@big-whale-labs/poseidon';
import MerkleTree  from '../../../cryptography/merkletree';
//import keypair from '../../../keypair.json';
import { Contract, Provider, utils } from "zksync-web3";
import {
    TEXT_COLOR,
    BORDER_COLOR,
    INPUT_BACKGROUND_HOVER_COLOR,
    INPUT_LABEL_BACKGROUND_COLOR,
    INPUT_BACKGROUND_COLOR
} from '../../../utils/colors';
import { setSource, switchNetwork } from '../../../utils/utils';
import * as ethers from 'ethers';
import { generatePair } from '../../../cryptography/lrs';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
//import Notification from '../../common/Notification';
import { TransactionDialogBox } from '../../common/TransactionDialogBox';
import { AcceptAGB } from './AcceptAGB';
import axios, { AxiosResponse } from "axios";
const _voterID = 'b01833143e6b75f918a574f9a39a66b250404c945ad0d64ec47b07b4b72c0bb88d9b181c386ff8132e2d5ba7ac4956a723e200925ab00d36bdd0b9a823a2580a';


export default function Login() {
    const [voterID, setVoterID] = useState('');
    const [credentials, setCredentials] = useState(null);
    const [showAGB, setShowAGB] = useState(false)
    //const [isVoterAuthenticated, setIsUserAuthenticated] = useState(false);
    const { state, dispatch } = useEth();
    const { chainId, l1Contracts, l2Contracts, accounts, web3, signer, artifacts, paymaster, isVoterAuthenticated } = state;
    const navigate = useNavigate();
    const { voteID } = useParams();
    const [openDialog, setOpenDialog] = useState(false);
    const [waitingMessage, setWaitingMessage] = useState(['']);
    const [progress, setProgress] = useState(0);
    const [buffer, setBuffer] = useState(10);
    const REGISTER_ADDRESS =  '0x6fE6a63e47a7E40989beB80d00Cb57C60046ED3e' //'0xD567799364D81B487A9626B2864feC02971Df6e2' //'0x3041abcb251FF01A41a9FA7D533186D9C92FbDb4' //'0x8CA5cBAB6859D77514F4BA22d54201619757D7c8' //'0xD3c666482aA63dFa1ffC776554CA0282521Fb464'//'0x8b3C5Af9f90734AF6625D7266BDD03E2BD7B659c';
    const loginMessagePart1 = 'Bitte geben Sie Ihre Zugangsdaten ein, um sich anzumelden.';
    const loginMessagePart2 = 'Sie haben Ihre Zugangsdaten als Datei während der Registrierung erhalten.';
    const BACKEND_URL = 'http://localhost:3100'


    const getVoterIDs = async() => {
        //const REGISTER_ADDRESS = '0xBb3185076500033a92b61Dd6Cee2F75a77679514';
        const l2Provider = new Provider('https://zksync2-testnet.zksync.dev');
        const REGISTER_ABI = (artifacts[3]).abi;
        const register = new Contract(REGISTER_ADDRESS, REGISTER_ABI, l2Provider);
        const voterIDs = await register.getVoterIDs();
        return voterIDs;
    }

    const handleShowAGB = () => {
        setShowAGB(prevValue => !prevValue);
    }
    
    const handleChangeVoterID = event => {
        setVoterID(event.target.value);
    }
    
    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    const handleSelectFile = (event) => {
        const file_to_read = event.target.files[0];
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            const content = e.target.result;
            const credentials = JSON.parse(content);
            setCredentials(credentials);
          };
          fileReader.readAsText(file_to_read);
    }

    const sendDataToTheBackend = async (pubKey, hashedId) => {
        try {
            let result;
            const contains = async () => {
                let { data } = await axios.get(BACKEND_URL + '/Vote/Voter');
                for (const id in data) {
                    data[id] = data[id].map((s) => BigInt("0x" + s));
                    for (let i = 0; i < data[id].length; i++) {
                        if (data[id][i] === BigInt('0x' + pubKey)) {
                            return true;
                        }
                    }
                }
                return false;
            }
            const cb = await contains()
            console.log('contains', cb);
            if (!cb) {
                result = await axios.post(BACKEND_URL + "/Vote/Voter", {
                    pubKey
                });
                /*
                for (const id in data) {
                    data[id] = data[id].map((s) => BigInt("0x" + s));
                }
                */
    
                console.log('data', result);
                
                // send hashedID to backend
                result = await axios.post(BACKEND_URL + "/Vote/HashedId", {
                    pubKey,
                    hashedId
                });
    
                console.log('result', result);
            }
            
            
        } catch (error) {
            console.log(error);
        }
        
    }

    useEffect(() => {
        if (credentials) {
            const hash = '0x' + poseidon(['0x' + credentials.id]);
            const hashedID = ethers.utils.hexlify(ethers.BigNumber.from(hash));
            const pubKey =  credentials.pk//.toString(16);
            console.log('hashed id', hashedID);
            console.log('pub key', pubKey);
            console.log('pub key big int', BigInt('0x' + pubKey));
            const pub1 = BigInt('0x' + pubKey).toString(16);
            console.log('pub key 1', pub1);

            const cb = async () => {
                let result;
                let { data } = await axios.get(BACKEND_URL + '/Vote/Voter');
                let contains = false;
                for (const id in data) {
                    data[id] = data[id].map((s) => BigInt("0x" + s));
                    for (let i = 0; i < data[id].length; i++) {
                        if (data[id][i] === BigInt('0x' + pubKey)) {
                            contains = true;
                        }
                    }
                }
                console.log('result', data);
                console.log('contains', contains);
            }

            const getTokens = async() => {
                const sessionId = 'f58277b8-84ac-4979-aeff-ee38b03cf93d';
                const pub = '5017868837e5d22477e75d69da6f7c2b219eb5d073d7e5dbaadf563812f34fa83f1d6f0078e0a0a2d06dde198a256a9fead8c208f91c1d6caa7af61b8836aa06d1d49471c52efecb898f63fd88cbe0f573739a7b10b68fe7a0b2c842c6619272'
                const result = await axios.post(BACKEND_URL + '/Vote/Voter/' + pubKey, {
                    sessionId
                });

                console.log('results 2', result);
            }

            cb();
            getTokens()
        }
    }, [credentials]);


    const handleLogin = async() => {
        setShowAGB(false);
        
        try {
            setOpenDialog(true);
            setWaitingMessage(['Anmeldung wird durchgefürht']);
            const l2Provider = new Provider('https://zksync2-testnet.zksync.dev');
            const REGISTER_ABI = (artifacts[3]).abi;
            const register = l2Contracts.Register; //new Contract(REGISTER_ADDRESS, REGISTER_ABI, l2Provider);
            const zkpABI = (require('../../../contracts/goerli/artifacts/contracts/VerifierZKPMembership.sol/VerifierZKPMembership.json')).abi;
            const verifierAddr = '0x0FBAdf651Aa50011f732Da44919616Ce67C91813'
            const MNEMONIC_GOERLI = "7b6a99cbccae2acf1cb5d737a5908c21cbbc5e913e239fbdf8b8f9e393c4843d";
            const api_key = '5603dfe25e514e7198477778e8c05c7b';
            const web3 = new ethers.providers.InfuraProvider('goerli', api_key);
            const wallet = new ethers.Wallet(MNEMONIC_GOERLI, web3);
            const verifier = new ethers.Contract(verifierAddr, zkpABI, web3) //l1Contracts.VerifierZKPMembership;
            console.log('register', register);
            //setWaitingMessage('Hashed ids werden herunterladen');
            const voterIDs = await register.getHashedIDs(); // Change the function name to getHashedIDs
            //console.log('ids', voterIDs);
            setProgress(10);
            setBuffer(20);
            let ids = [];
            const i = 15;
            for (let i = 0; i < voterIDs.length; i++) {
                ids[i] = BigInt(voterIDs[i].slice(2));
            }
    
            //setWaitingMessage('Merkle tree und memebership proof werden erzeugt');
            const merkleTree = new MerkleTree(ids, { isHashed: true });
            //console.log('merkle', merkleTree);
            console.log('credentials', credentials);
            const voterID = credentials.id;
            const hashedID = poseidon(['0x' + voterID]);
            const pubKey =  credentials.pk.toString(16);
            console.log('pub key', pubKey);
            const depth = merkleTree.getDepth();
            const proofOfMembership = merkleTree.getProof(hashedID);
            //console.log('proof of membership', proofOfMembership);
            setProgress(20);
            setBuffer(50);
        
        initialize().then( async zokratesProvider => {
            //setWaitingMessage('Zero Knowledge credentials werden generiert');
            console.log('Compiling the program...');
            const artifacts = zokratesProvider.compile(setSource(depth));
            //console.log(artifacts);
            const args = [merkleTree.getRoot().toString(), proofOfMembership.voterID, proofOfMembership.directionSelector, proofOfMembership.siblingValues];
            //console.log('args', args);
            console.log('Generating the witness...');
            setProgress(50);
            setBuffer(60);
            const keypair = require(`../../../data/keypairs/keypairDepth${depth}.json`);
            const { witness, output } = zokratesProvider.computeWitness(artifacts, args);
            //console.log('witness', witness);
            //const Keypair = zokratesProvider.setup(artifacts.program);
            //setWaitingMessage('Zero knowledge proof wird generiert');
            console.log('Generating the proof...');
            const proof = zokratesProvider.generateProof(artifacts.program, witness, keypair.pk);
            setProgress(60);
            setBuffer(70);
            //console.log('proof:', proof);
            //const verify = zokratesProvider.verify(keypair.vk, proof);
            //console.log('verify', verify);
            //setWaitingMessage('Zero Knowledge proof wird zur Verifizierung an die der Blockchain gesendet.\n Transaction bitte bestätigen!');
            
            try {
                const vk = {
                    beta: keypair.vk.beta,
                    alpha: keypair.vk.alpha,
                    gamma: keypair.vk.gamma,
                    delta: keypair.vk.delta,
                    gamma_abc: keypair.vk.gamma_abc
                }
                const gasLimit = await verifier.estimateGas.verifyTx(vk, proof.proof, proof.inputs);
                console.log('gasLimit', ethers.utils.formatEther(gasLimit));
                const txHandle = await verifier.callStatic.verifyTx(vk, proof.proof, proof.inputs, { gasLimit });
                console.log('tx', txHandle);
                setProgress(70);
                setBuffer(80);
                //setWaitingMessage('Verifizierung läuft');
            
                setProgress(80);
                setBuffer(100);
                if (txHandle) {
                    console.log('Here')
                    //alert('Authentication successful.');
                    //switchNetwork('zksync');
                    // TODO: store voter address to the register contract on zksync
                    
                    try {
                        const address = await signer.getAddress();
                        const paymasterParams = utils.getPaymasterParams(paymaster, {
                            type: 'General',
                            innerInput: new Uint8Array(),
                            });
                    
                            const gasPrice = await l2Provider.getGasPrice();
                            console.log('gas ', gasPrice);

                            const message1 = 'Anmeldung erfolreich!';
                
                            setWaitingMessage([message1,])
                            //setIsUserAuthenticated(true);
                            sendDataToTheBackend(pubKey, hashedID.toString(16));
                            dispatch( {
                                type: actions.init,
                                data: { isVoterAuthenticated: true}
                            })
                            setProgress(100);
                            
                    /*
                        const gasLimit = await register.connect(signer).estimateGas.addEligibleVoter(
                            address,
                            
                            {
                                customData: {
                                    gasPerPubData: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
                                    paymasterParams
                                },
                            }
                            
                        );
                        const txHandle = await register.connect(signer).addEligibleVoter(
                            address,
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
                            if (e.event === 'VoterAdded') {
                                const message1 = 'Anmeldung erfolreich!';
                                //const message2 = 'Um fortzufahren, bestätigen Sie bitte das Netzwerkwechseln'
                                setWaitingMessage([message1,])
                                setIsUserAuthenticated(true);
                                setProgress(100);
                            }
                        });
                        */
                       console.log('Here 2')
                       } catch (error) {
                        setProgress(0);
                        setBuffer(10)
                        setWaitingMessage([error.code]);
                       }

                } else {
                    setWaitingMessage(['Anmeldung fehlgeschlagen!']);
                    setProgress(100);
                }

                /*
                const receipt = await txHandle.wait();
                console.log('receipt', receipt); 
                const events = receipt.events;
                events.forEach(event => {
                    if (event.event === 'AuthentificationStatus') {
                        console.log('argument', event.args[0]);
                        if (event.args[0]) {
                            //alert('Authentication successful.');
                            setWaitingMessage('Anmeldung erfolreich! \n Sie werden automatisch an die Voting-Cockpit weitergeleitet. \n Bestätigen Sie bitte das Netzwerkwechseln.')
                            setIsUserAuthenticated(true);
                            setProgress(100);
                            switchNetwork('zksync');
                            // TODO: store voter address to the register contract on zksync
                        } else {
                            setWaitingMessage('Anmeldung fehlgeschlagen!');
                            setProgress(100);
                        }
                    }
                })
                */
               
            } catch (error) {
                for (const [key, value] of Object.entries(error)) {
                    let message;
                    if (key === 'reason') {
                        setWaitingMessage([message]);
                    }
                    if (key === 'code') {
                        setWaitingMessage(prevValue => [prevValue + '' + value]);
                    }
                    console.log(`${key}: ${value}`);
                  }
                console.log('ERROR:', Object.entries(error));
                console.log('ERROR:', error);
                //setWaitingMessage(error);
                setProgress(0);
                setBuffer(10);
            }
        
        })
        
        } catch (error) {
            console.error(error);
            let message = error.message;
            //console.log('errorrrr:', error.message);
            if (error.message === 'Node undefined') {
                message = 'Zugangsdaten ungültig.'
            }
            setWaitingMessage([message]);
            setProgress(0);
            setBuffer(10);
        }
       
    }

    const handleLogin0 = () => {
        setShowAGB(false);
        setOpenDialog(true);
        handleLogin()
    }

    useEffect(()=> {
        if (!isVoterAuthenticated && chainId !== '0x118' ) switchNetwork('zksync');
     }, [isVoterAuthenticated, chainId]);
/*
     useEffect(()=> {
        if (isVoterAuthenticated ) switchNetwork('zksync');
     }, [isVoterAuthenticated, chainId]);
*/
     useEffect(()=> {
        if (isVoterAuthenticated && chainId === '0x118') {
            dispatch({
                type: actions.init,
                data: { isVoterAuthenticated: true}
            })
            navigate(`/vote/voting-cockpit/${voteID}`, { state: { credentials}});
        }
     }, [isVoterAuthenticated, navigate, voteID, chainId]);

     useEffect(() => {
        const pair = generatePair();
        //console.log('pair', pair.publicKey.toString(16))
        const send = async () => {
         const hash = poseidon(['0x' + credentials.id]);
         console.log('hash', hash);
         console.log('hash"string', hash.toString());
          await axios.post(BACKEND_URL + "/Vote/HashedId", {
            pubKey: credentials.pk.toString(16),
            hashedId: hash.toString(),
          });
          
        };

    }, [credentials]);


  return (
    <Container
        sx={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 10,
        }}
    >
        
        <TransactionDialogBox openDialog={openDialog} handleCloseDialog={handleCloseDialog} waitingMessage={waitingMessage} progress={progress} buffer={buffer} />
        <Box
            sx={{
                width:{xs: '100%', sm: '90%', md: '80%', lg: '60%', xl: '60%'},
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
                            fontSize:{xs: 25, sm: 20, md: 30, lg: 30, xl: 30},
                            color: grey[200],
                            mt: 1,
                            ml:1,
                            //mr:10
                        }}
                    />
                </InputAdornment>
                {loginMessagePart1} <br /> {loginMessagePart2}
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
                    defaultValue='Zugangsdaten'
                    size='normal'
                    inputProps={{ style: { WebkitTextFillColor: TEXT_COLOR, textAlign: 'center'} }}
                    sx={{ 
                        width:{xs: 1/2, sm: 1/2, md: 1/3, lg: 1/3, xl: 1/3}, 
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
                    type= 'file'
                    onChange={handleSelectFile}
                    //value={voterID} 
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
           
            { 
                <Button
                variant='contained'
                size='large'
                onClick={handleShowAGB}
                disabled={credentials === null? true: false}
                sx={{
                    width: 1,
                    fontSize: 12,
                    backgroundColor: teal[500],
                    ":hover": {
                            backgroundColor: teal[700]
                    }
                }}
            >
                    Weiter mit Anmeldung
            </Button> 
            }         
        </Box>

        {(showAGB) && 
            <AcceptAGB openDialog={showAGB} handleCloseDialog={handleShowAGB} handleLogin={handleLogin} />
        }
    </Container>
  )
}
