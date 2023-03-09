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
import keypair from '../../../keypair.json';
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


export default function Login() {
    const [voterID, setVoterID] = useState('');
    const { state, dispatch } = useEth();
    const { chainId, l1Contracts, accounts, web3, signer, artifacts,  } = state;
    
    
    useEffect(()=> {
       // if (chainId !== '0x5' ) switchNetwork('goerli');
    }, [chainId]);

    const getVoterIDs = async() => {
        const REGISTER_ADDRESS = '0xBb3185076500033a92b61Dd6Cee2F75a77679514';
        const l2Provider = new Provider('https://zksync2-testnet.zksync.dev');
        const REGISTER_ABI = (artifacts[3]).abi;
        const register = new Contract(REGISTER_ADDRESS, REGISTER_ABI, l2Provider);
        const voterIDs = await register.getVoterIDs();
        return voterIDs;
    }
    
    const handleChangeVoterID = event => {
        setVoterID(event.target.value);
    }

    const handleClickLoginButton = async() => {
        const REGISTER_ADDRESS = '0x8b3C5Af9f90734AF6625D7266BDD03E2BD7B659c';
        const l2Provider = new Provider('https://zksync2-testnet.zksync.dev');
        const REGISTER_ABI = (artifacts[3]).abi;
        const register = new Contract(REGISTER_ADDRESS, REGISTER_ABI, l2Provider);
        const verifier = l1Contracts.Verifier;
        //console.log('ver', verifier);
        const voterIDs = await register.getVoterIDs();
        let ids = [];
        for (let i = 0; i < voterIDs.length; i++) {
            ids[i] = BigInt(voterIDs[i].slice(2));
        }
        console.log('hashed voter ids', ids);
        const merkleTree = new MerkleTree(ids, { isHashed: true });
        console.log('merkle', merkleTree);
        const hashedID = poseidon(['0x' + voterID]);
        const depth = merkleTree.getDepth();
        const proofOfMembership = merkleTree.getProof(hashedID);
        console.log('proof of membership', proofOfMembership);
        
        initialize().then( async zokratesProvider => {
            console.log('Compiling the program...');
            const artifacts = zokratesProvider.compile(setSource(depth));
            console.log(artifacts);
            const args = [merkleTree.getRoot().toString(), proofOfMembership.voterID, proofOfMembership.directionSelector, proofOfMembership.siblingValues];
            console.log('args', args);
            console.log('Generating the witness...');
            const { witness, output } = zokratesProvider.computeWitness(artifacts, args);
            //console.log('witness', witness);
            //const Keypair = zokratesProvider.setup(artifacts.program);
            console.log('Generating the proof...');
            const proof = zokratesProvider.generateProof(artifacts.program, witness, keypair.pk);
            console.log('proof:', proof);
            const verify = zokratesProvider.verify(keypair.vk, proof);
            //console.log('verify', verify);
            const gasLimit = await verifier.estimateGas.verifyTx(proof.proof, proof.inputs);
            console.log('gasLimit', ethers.utils.formatEther(gasLimit));
            try {
                const txHandle = await verifier.connect(signer).verifyTx(proof.proof, proof.inputs, { gasLimit});
                console.log('tx', txHandle);
                const receipt = await txHandle.wait();
                const events = receipt.events;
                events.forEach(event => {
                    if (event.event === 'AuthentificationStatus') {
                        console.log('argument', event.args[0]);
                        if (event.args[0]) {
                            alert('Authentication successful.');
                        }
                    }
                })
                console.log('receipt', receipt);
            } catch (error) {
                console.log('error', error);
            }
        })
        
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
