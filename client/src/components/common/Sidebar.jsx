import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { useEth, actions } from '../../contexts/EthContext';

import { 
    Drawer,
    Box,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
 } from '@mui/material';

import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import BallotIcon from '@mui/icons-material/Ballot';
import Toolbar from '@mui/material/Toolbar';
import { SUCCESS_COLOR, TEXT_COLOR, SUCCESS_COLOR_HOVER } from '../../utils/colors';
import WalletButton from './WalletButton';
import RegisterPeriod from './RegisterPeriod';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
    const { state: { isDrawerOpen, openRegisterDialogBox }, dispatch} = useEth();
    const prevRoute = useLocation().pathname;
    const [openDialog, setOpenDialog] = useState(false);
    const navigate = useNavigate();

    
    const setDrawer = (val) => {
      dispatch({
        type: actions.init,
        data: { 
          isDrawerOpen: val,
         }
      });
    }

    const toggleDrawer = (open) => (event) => {
      console.log('event', event)
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
          return;
        }
        setDrawer(open);
    };

    const setOpenRegisterDialogBox = () => {
      console.log('it is working!')
      dispatch({
        type: actions.init,
        data: { 
          openRegisterDialogBox: true,
         }
      });
    }
    const handleCloseRegisterDialog = () => {
      setOpenDialog(false);
    }
    

    const list = () => (
        <Box
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 300 }}
          role="presentation"
          //onClick={toggleDrawer(false)}
          //onKeyDown={toggleDrawer(false)}
        >
            <Button 
                variant="contained" 
                size='large'
                onClick={() => {
                  setDrawer(false);
                  navigate('/admin/vote/create', { state: {prevRoute}})}
                }
                sx={{
                    width: 250,
                    marginTop:2,
                    marginRight:0,
                    marginBottom:2,
                    fontSize:12,
                    backgroundColor: SUCCESS_COLOR,
                    ":hover": {
                        backgroundColor: SUCCESS_COLOR_HOVER,
                    }
                }}
            >
              Neue Wahl Erstellen
            </Button>
          <Divider />
          <List>
            <Box sx={{ 
              display: {xs: 'none', sm: 'none', md: 'none', lg: 'none', xl: 'none'},
             // border: 'solid 1px red'
            }}>
              <WalletButton width={250}/>
            </Box>
            <ListItem disablePadding >
                <ListItemButton onClick={() => {
                  setDrawer(false);
                  navigate('/admin/home');
                }} >
                  <ListItemIcon>
                    <BallotIcon fontSize='large' />
                  </ListItemIcon>
                  <ListItemText primary='Meine Wahlen' primaryTypographyProps={{fontSize: '15px'}}/>
                </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
                <ListItemButton onClick= {() => {
                  //setDrawer(false);
                  setOpenDialog(true) }
                  } >
                  <ListItemIcon>
                    <AccessTimeFilledIcon fontSize='large' />
                  </ListItemIcon>
                  <ListItemText primary='Registrierung einstellen' primaryTypographyProps={{fontSize: '15px'}}/>
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton >
                  <ListItemIcon>
                    <LogoutIcon fontSize='large' />
                  </ListItemIcon>
                  <ListItemText primary='Abmelden' primaryTypographyProps={{fontSize: '15px'}}/>
                </ListItemButton>
              </ListItem>

            
            
          </List>
        </Box>
      );

  

  return (
    <div>
        <Drawer
            anchor='left'
            open={isDrawerOpen}
            //onClose={toggleDrawer(false)} 
            ModalProps={{
              sx:{
                //width: '70%',
                backgroundColor: 'rgb(255, 255, 255, 0.1)',
               
              }
              
            }}
        >
            <Toolbar />
            {list()}
        </Drawer>
        {  <RegisterPeriod openDialog={openDialog} handleCloseDialog={handleCloseRegisterDialog} />}
    </div>
  )
}

/*
{['Meine Wahlen', 'Registrierung Einstellen', 'Profil', 'Abmelden'].map((text, index) => (
              <ListItem key={index} disablePadding >
                <ListItemButton onClick={ text === 'Registrierung Einstellen'? () => setOpenDialog(true) : () => console.log('not working!') } >
                  <ListItemIcon>
                    {text === 'Meine Wahlen' && <BallotIcon fontSize='large' />}
                    {text === 'Registrierung Einstellen' && <AccessTimeFilledIcon fontSize='large' />}
                    {text === 'Profil' && <PersonIcon fontSize='large'/> }
                    {text === 'Abmelden' && <LogoutIcon fontSize='large' />}
                  </ListItemIcon>
                  <Link to={text==='Meine Wahlen' && '/admin/home'} style={{textDecoration: 'none', color: TEXT_COLOR, }}>
                    <ListItemText primary={text} primaryTypographyProps={{fontSize: '15px'}}/>
                  </Link>
                </ListItemButton>
              </ListItem>
            ))}
 */