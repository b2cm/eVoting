import React from 'react';
import {
    Paper,
    Box
} from '@mui/material';

export default function Foo() {
  return (
    <Box sx={{
      marginTop: 'calc(10% + 60px)',
    position: 'fixed',
    bottom: 0,
    width: '100%',
    height: '100px',
    backgroundColor: 'grey'
    }} component="footer" square variant="outlined">

    </Box>
  )
}
