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
import { Contract, Provider } from "zksync-web3";
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
const _voterID = 'b01833143e6b75f918a574f9a39a66b250404c945ad0d64ec47b07b4b72c0bb88d9b181c386ff8132e2d5ba7ac4956a723e200925ab00d36bdd0b9a823a2580a';


export default function Login() {
    const [voterID, setVoterID] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { state, dispatch } = useEth();
    const { chainId, l1Contracts, accounts, web3, signer, artifacts,  } = state;
    const navigate = useNavigate();
    const { voteID } = useParams();
    const [openDialog, setOpenDialog] = useState(false);
    const [waitingMessage, setWaitingMessage] = useState('');
    const [progress, setProgress] = useState(0);
    const [buffer, setBuffer] = useState(10);
    const REGISTER_ADDRESS = '0x8CA5cBAB6859D77514F4BA22d54201619757D7c8' //'0xD3c666482aA63dFa1ffC776554CA0282521Fb464'//'0x8b3C5Af9f90734AF6625D7266BDD03E2BD7B659c';
    

    const getVoterIDs = async() => {
        //const REGISTER_ADDRESS = '0xBb3185076500033a92b61Dd6Cee2F75a77679514';
        const l2Provider = new Provider('https://zksync2-testnet.zksync.dev');
        const REGISTER_ABI = (artifacts[3]).abi;
        const register = new Contract(REGISTER_ADDRESS, REGISTER_ABI, l2Provider);
        const voterIDs = await register.getVoterIDs();
        return voterIDs;
    }
    
    const handleChangeVoterID = event => {
        setVoterID(event.target.value);
    }
    
    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    const handleClickLoginButton = async() => {
        try {
            setOpenDialog(true);
            setWaitingMessage('Anmeldung wird durchgefürht');
        const l2Provider = new Provider('https://zksync2-testnet.zksync.dev');
        const REGISTER_ABI = (artifacts[3]).abi;
        const register = new Contract(REGISTER_ADDRESS, REGISTER_ABI, l2Provider);
        const verifier = l1Contracts.VerifierZKPMembership;
        //console.log('ver', verifier);
        setWaitingMessage('Hashed ids werden herunterladen');
        const voterIDs = await register.getHashedIDs();
        setProgress(10);
        setBuffer(20);
        let ids = [];
        const i = 15;
        for (let i = 0; i < voterIDs.length; i++) {
            ids[i] = BigInt(voterIDs[i].slice(2));
        }
    
        setWaitingMessage('Merkle tree und memebership proof werden erzeugt');
        const merkleTree = new MerkleTree(ids, { isHashed: true });
        //console.log('merkle', merkleTree);
        const hashedID = poseidon(['0x' + _voterID]);
        //console.log('hashed id', hashedID);
        const depth = merkleTree.getDepth();
        const proofOfMembership = merkleTree.getProof(hashedID);
        //console.log('proof of membership', proofOfMembership);
        setProgress(20);
        setBuffer(50);
        
        initialize().then( async zokratesProvider => {
            setWaitingMessage('Zero Knowledge credentials werden generiert');
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
            setWaitingMessage('Zero knowledge proof wird generiert');
            console.log('Generating the proof...');
            const proof = zokratesProvider.generateProof(artifacts.program, witness, keypair.pk);
            setProgress(60);
            setBuffer(70);
            //console.log('proof:', proof);
            //const verify = zokratesProvider.verify(keypair.vk, proof);
            //console.log('verify', verify);
            setWaitingMessage('Zero Knowledge proof wird zur Verifizierung an die der Blockchain gesendet.\n Transaction bitte bestätigen!');
            
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
                setWaitingMessage('Verifizierung läuft');
                //const receipt = await txHandle.wait();
                //console.log('receipt', receipt);
                setProgress(80);
                setBuffer(100);
                if (txHandle) {
                    //alert('Authentication successful.');
                    setWaitingMessage('Anmeldung erfolreich! \n Sie werden automatisch an die Voting-Cockpit weitergeleitet. \n Bestätigen Sie bitte das Netzwerkwechseln.')
                    setIsAuthenticated(true);
                    setProgress(100);
                    //switchNetwork('zksync');
                    // TODO: store voter address to the register contract on zksync
                } else {
                    setWaitingMessage('Anmeldung fehlgeschlagen!');
                    setProgress(100);
                }
                /*
                const events = receipt.events;
                events.forEach(event => {
                    if (event.event === 'AuthentificationStatus') {
                        console.log('argument', event.args[0]);
                        if (event.args[0]) {
                            //alert('Authentication successful.');
                            setWaitingMessage('Anmeldung erfolreich! \n Sie werden automatisch an die Voting-Cockpit weitergeleitet. \n Bestätigen Sie bitte das Netzwerkwechseln.')
                            setIsAuthenticated(true);
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
                        setWaitingMessage(message);
                    }
                    if (key === 'code') {
                        setWaitingMessage(prevValue => prevValue + '' + value);
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
            console.log('errorrrr:', error);
            setWaitingMessage(error);
            setProgress(0);
            setBuffer(10);
        }
        
    }

    useEffect(()=> {
        //if (!isAuthenticated && chainId !== '0x5' ) switchNetwork('hardhat');
     }, [isAuthenticated, chainId]);

     useEffect(()=> {
        if (isAuthenticated && chainId === '0x118') {
            navigate(`/vote/voting-cockpit/${voteID}`, { state: { isAuthenticated: true}});
        }
     }, [isAuthenticated, navigate, voteID, chainId]);


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
                width: '100%',
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
                Geben Sie bitte Ihr Wähler-ID, um Sie anmelden zu können.
                <br />
                Der Wähler-ID haben Sie während der Registrierung erhalten.
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
                    defaultValue='Wähler-ID'
                    size='normal'
                    inputProps={{ style: { WebkitTextFillColor: TEXT_COLOR, textAlign: 'center'} }}
                    sx={{ 
                        width:1/5, 
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
                    type= 'text'
                    onChange={handleChangeVoterID}
                    value={voterID} 
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
        
            <Button
                variant='contained'
                size='large'
                onClick={handleClickLoginButton}
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
