import React, { useEffect } from 'react';
import {
    Paper,
    Box,
    Button,
} from '@mui/material';
import { async } from 'q';

export default function Foo() {

  function downloadJSON() {
    const data = {
      description: " just a test"
    }
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    console.log('url', url);
    const link = document.createElement('a');
    //link.href = url;
    //link.target = '_blank';
    window.open(url)
    link.download = 'data.json';
    link.textContent = 'Download JSON';

    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  
  }
  

  useEffect( () => {

   async function detectBrowser() {
      if (navigator.userAgentData) {
        const browserName = navigator.userAgentData.brands.find((brand) => brand.brand === 'Google Chrome' || brand.brand === 'Mozilla Firefox' || brand.brand === 'Apple Safari' || brand.brand === 'Microsoft Edge' || brand.brand === 'Opera' || brand.brand === 'Internet Explorer');
        alert('test',);
        if (browserName) {
          console.log("Detected browser:", browserName.brand);
          alert("Detected browser:", browserName.brand);
          return browserName.brand;
        }
      }
    
      return "Unknown";
    }
    //detectBrowser();
    

  })
  
  return (
    <Box sx={{
      marginTop: 'calc(10% + 60px)',
    position: 'fixed',
    bottom: 0,
    width: '100%',
    height: '100px',
    backgroundColor: 'grey'
    }} component="footer" square variant="outlined">
      <Button variant='contained' onClick={downloadJSON}>
        Download
      </Button>

    </Box>
  )
}
