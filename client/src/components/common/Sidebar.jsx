import React from 'react';
import { useState } from 'react';
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

import { teal } from '@mui/material/colors';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import BallotIcon from '@mui/icons-material/Ballot';
import Toolbar from '@mui/material/Toolbar';
import { TEXT_COLOR } from '../../utils/colors';

export default function Sidebar() {
    const { state: { isDrawerOpen, }, dispatch} = useEth();
    const prevRoute = useLocation().pathname;
    
    const setDrawer = (val) => {
      dispatch({
        type: actions.init,
        data: { 
          isDrawerOpen: val,
         }
      });
    }

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
          return;
        }
        setDrawer(open);
    };

    const list = () => (
        <Box
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 300 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          //onKeyDown={toggleDrawer(false)}
        >
            <Button 
                variant="contained" 
                size='large'
                sx={{
                    width: 250,
                    marginTop:2,
                    marginRight:0,
                    marginBottom:2,
                    fontSize:12,
                    backgroundColor: teal[500],
                    ":hover": {
                        backgroundColor: teal[700]
                    }
                }}
            >
              <Link to={'/vote/create'} 
                state={{prevRoute}}
                style={{textDecoration: 'none', color: 'white'}}>
                Neue Wahl Erstellen
              </Link>
            </Button>
          <Divider />
          <List>
            {['Meine Wahlen', 'Registrierung Einstellen', 'Profil', 'Abmelden'].map((text, index) => (
              <ListItem key={index} disablePadding >
                <ListItemButton >
                  <ListItemIcon>
                    {text === 'Meine Wahlen' && <BallotIcon fontSize='large' />}
                    {text === 'Registrierung Einstellen' && <AccessTimeFilledIcon fontSize='large' />}
                    {text === 'Profil' && <PersonIcon fontSize='large'/> }
                    {text === 'Abmelden' && <LogoutIcon fontSize='large' />}
                  </ListItemIcon>
                  <Link to={text==='Meine Wahlen' && '/'} style={{textDecoration: 'none', color: TEXT_COLOR, }}>
                    <ListItemText primary={text} primaryTypographyProps={{fontSize: '15px'}}/>
                  </Link>
                </ListItemButton>
              </ListItem>
            ))}
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
    </div>
  )
}