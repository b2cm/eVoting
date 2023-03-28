import  React from 'react';
import { useLocation } from 'react-router-dom';
import { useEth, actions } from '../../contexts/EthContext';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { 
    blueGrey,
 } from '@mui/material/colors';
import Sidebar from '../common/Sidebar';
import WalletButton from '../common/WalletButton';
import { Link } from 'react-router-dom';

export default function Header() {
    const { state: {isDrawerOpen, }, dispatch } = useEth();
    const location  = useLocation();
    const showMenuButton = location.pathname === '/registration' || location.pathname.startsWith('/vote/login/') || location.pathname.startsWith('/vote/voting-cockpit/') ? false : true;

    const setDrawer = (val) => {
      dispatch({
        type: actions.init,
        data: { 
          isDrawerOpen: val,
         }
      });
    }


  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: blueGrey[500],
          //border: 'solid 10px black'
        }}
      >
        <Toolbar
           sx={{ 
              display: {xs: 'flex', sm: 'flex', md: 'flex', lg: 'flex', xl: 'flex'},
             // border: 'solid 1px red'
            }}
        >
      
            <Box width={{xs: 35, sm: 40, md:200, lg: 200, xl:200}}>
               {showMenuButton &&
                <>
                  {!isDrawerOpen && 
                  <IconButton
                      size="large"
                      edge="start"
                      color="inherit"
                      aria-label="menu"
                      sx={{
                          //mr: 2,
                          //border: 'solid 1px blue'
                      }}
                      onClick={() => setDrawer(true)}
                  >
                      <MenuIcon sx={{
                          fontSize: 35
                      }} />
                  </IconButton>
                }
                {isDrawerOpen && 
                  <IconButton
                      size="large"
                      edge="start"
                      color="inherit"
                      aria-label="menu"
                      sx={{
                          //mr: 2,
                      }}
                      onClick={() => setDrawer(false)}
                  >
                      <CloseIcon sx={{
                          fontSize: 35 
                      }} />
                  </IconButton>
                }
                </>
               }
             </Box>
             

          <Typography 
              variant="h4" 
              component="div" 
              sx={{
                  //width: 200,
                  flexGrow: 1,
                  display:'flex',
                  justifyContent: 'center',
                  fontSize:25, 
                  //border: 'solid 1px blue', 
              }}
            >
              <Link to={'/'} style={{textDecoration: 'none', color: 'white'}}>
                E-VOTING
              </Link>
          </Typography>  

          <Box sx={{ 
              display: {xs: 'none', sm: 'none', md: 'block', lg: 'block', xl: 'block'},
             // border: 'solid 1px red'
            }}
          >
          <WalletButton width={200} />
          </Box> 
        </Toolbar>


       
    </AppBar>
      {isDrawerOpen && <Sidebar /> }
    </>
  );
}
