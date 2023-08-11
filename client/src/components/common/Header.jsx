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
    // `${process.env.PUBLIC_URL}`
    const showMenuButton = //location.pathname === '/registration' ||
                          location.pathname.includes('/vote/login/') ||
                          location.pathname.includes('/login') ||
                          location.pathname.includes('/registration') ||
                          location.pathname.includes('/vote/voting-cockpit/') ||
                          location.pathname.includes('/admin/login') ||
                          location.pathname === ('/logout') ||
                          location.pathname === ('/')
                          ? false : true;

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
              //border: 'solid 1px red'
            }}
        >
      
            <Box 
              sx={{ 
                display: {xs: 'none', sm: 'flex', md: 'flex', lg: 'flex', xl: 'flex'},
                border: 'solid 1px red'
              }}
              width={{xs: 150, sm: 150, md:200, lg: 200, xl:200}}>
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
                  //width: 1,
                  flexGrow: 1,
                  display:'flex',
                  justifyContent: 'center',
                  fontSize:25, 
                  //border: 'solid 1px blue', 
              }}
            >
              {showMenuButton &&
              <Link to={'/admin/home'}  style={{textDecoration: 'none', color: 'white'}}>
              E-VOTING
            </Link>
              }
              {!showMenuButton && <span>E-VOTING</span>}
          </Typography> 

          {(location.pathname !== '/logout') ? 
              <Box sx={{ 
                display: {xs: 'block', sm: 'block', md: 'block', lg: 'block', xl: 'block'},
              // border: 'solid 1px red'
              }}
              >
                <WalletButton width={{xs: 150, sm: 150, md: 200, lg: 200, xl: 200}} />
              </Box>
              :
              <Box width={200} />
           } 

           
        </Toolbar>


       
    </AppBar>
      {isDrawerOpen && <Sidebar /> }
    </>
  );
}
