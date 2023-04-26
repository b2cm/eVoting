import React from 'react';
import {
    Box,
    Button,
    Typography
} from '@mui/material';
import {
    Link
} from 'react-router-dom';
import {
    teal
} from '@mui/material/colors';
import {
    TEXT_COLOR
} from '../../../utils/colors';

export default function HomeHeader() {
    
  return (
    <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                //border: 'solid 1px',
                //justifyContent: 'space-between'
                textAlign: 'center',
            }}
        >
            <Button variant='contained'
                size='large'
                sx={{
                    display: {xs: 'none', sm: 'block', md: 'block', lg: 'block', xl: 'block'},
                    width:{xs: 300 , sm: 100, md: 200, lg: 200, xl: 200},
                    fontSize:12,
                    backgroundColor: teal[500],
                    ":hover": {
                        backgroundColor: teal[700]
                    }
                }}>
                <Link to={'/admin/vote/create'} 
                    style={{textDecoration: 'none', color: 'white'}}>
                    Neue Wahl Erstellen
                 </Link>
            </Button>
            
            <Box sx={{
                flexGrow: 1, //5/6,
                flexDirection: 'column',
                //border: 'solid 1px green',
               
            }}>
                <Typography style={{ color: TEXT_COLOR, fontSize: 20, fontWeight: 'bold'}}>
                    Meine Wahlen
                </Typography>
            </Box>

            <Box width={200} sx={{
                display: {xs: 'none', sm: 'block', md: 'block', lg: 'block', xl: 'block'},
            }}>

            </Box>
        </Box>
  )
}
