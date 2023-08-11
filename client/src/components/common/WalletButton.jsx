import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import {
  Box,
} from '@mui/material';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useEth } from '../../contexts/EthContext';
import {  actions } from "../../contexts/EthContext/state";
import { Contract, Provider, Web3Provider } from "zksync-web3";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export default function WalletButton(props) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const { state, dispatch } = useEth();
    const { signer, accounts } = state;
    const [anchor, setAnchor] = useState(null);
    const { width } = props;

    
    const isOpen = Boolean(anchor);
    const handleClick = (event) => {
      setAnchor(event.currentTarget);
    }

    const close = () => {
      setAnchor(null)
    }

    const textColor = '#000000DB';
    const menuItems = ['Wallet trennen', 'Profile', 'Abmelden'];

    const connectWallet = async () => {
       //const accounts = await state.web3.eth.requestAccounts()
       const accounts = await window.ethereum.request({ method: 'eth_requestAccounts'});
       const signer = (new Web3Provider(window.ethereum)).getSigner();
       //console.log('signer2', await signer.getAddress());
        dispatch({
            type: actions.init,
            data: { 
              accounts,
              signer,
             }
          });
    }

    const shortAddress = () => {
      console.log(signer)
      const address = accounts[0];
        return `${address.slice(0, 6)}...${address.slice(address.length - 4)}`;
    }

  const handleToggle = (event) => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  // Unfortunally, we can disconnect the wallet programmatically. We just set the accounts to null.
  const disconnectWallet = () => {
    const accounts = null;
    dispatch({
      type: actions.init,
      data: { 
        accounts,
        signer: null
       }
    });
  }

  const handleMenuItemClick = (event, index) => {
    handleClose(event);

    switch(index) {
      case 0:
        disconnectWallet();
        break;
      case 1:
        console.log(index, event);
        break;
      case 2:
        console.log(index, event)
        break;
      default:
        break;
    }
  }

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      // anchorRef.current is null here.
      //anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <Box>
      {signer &&
      <Button
        ref={anchorRef}
        //onClick={handleToggle}
        startIcon={<Jazzicon diameter={25} seed={jsNumberForAddress(accounts[0])} />}
        //endIcon={!open ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        variant="outlined" 
        size='small' 
        id="composition-button"
        aria-controls={open ? 'composition-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        color="inherit"
        sx={{ 
          fontSize:12, 
          width
        }}
      >
       {shortAddress()}
      </Button>      
      }

      {!signer &&
        <Button 
        onClick={connectWallet}
        color="inherit" 
        variant="outlined" 
        size='small'
        sx={{
            fontSize:12,
            width
            //border: 'solid 1px blue'
        }}>
        Wallet Verbinden
      </Button>
      }
       
       
      
    </Box>
  );
}
