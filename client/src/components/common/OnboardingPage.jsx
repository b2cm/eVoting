import React, {
    useRef,
    useEffect, 
    useState
} from 'react';
import {
    Box,
    Button,
} from '@mui/material';
import MetaMaskOnboarding from '@metamask/onboarding';
import detectEthereumProvider from '@metamask/detect-provider';
import { actions, useEth } from '../../contexts/EthContext';
import Home from '../admin/Home/Home';
import { Navigate, useNavigate } from 'react-router-dom';

export default function OnboardingPage(props) {
    const { state, dispatch } = useEth();
    const {  ethProvider } = state;
    const onboarding = useRef();
    const [ provider, setProvider ] = useState(ethProvider);
    const [accounts, setAccounts] = useState([]);
    const navigate = useNavigate();

    const startOnboarding = () => {
         if (!onboarding.current) {
          onboarding.current = new MetaMaskOnboarding();
          onboarding.current.startOnboarding();
        }
    }

    const stopOnboarding = () => {
         if (onboarding.current) {
          onboarding.current.stopOnboarding();
        }
    }

    const connectWallet = () => {
        provider.request({ method: 'eth_requestAccounts' })
        .then(acc => setAccounts(acc));
    }

    useEffect(() => {
        const getProvider = async () => { 
            const provider = await detectEthereumProvider();
            setProvider(provider);
        }

        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            getProvider();
            dispatch( {
                type: actions.init,
                data: { ethProvider: provider }
            })
            if (accounts.length > 0 && onboarding.current) {
                onboarding.current.stopOnboarding();
            }
        }
    }, [accounts]);

   useEffect(() => {
    if (provider) {
        navigate('/admin/login');
    }
   }, [provider, navigate]);

  return (
    <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        mt: 5
    }}>
        {(!provider) &&
        <>
            <Button 
            variant='outlined' 
            size='large' 
            onClick={startOnboarding}>
                Metamask herunterladen
            </Button>
        </>
        }

    </Box>
  )
}
