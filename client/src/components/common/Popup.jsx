import React, { useState, } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
    styled,
    Box,
    Container,
    IconButton,
    Button,
    Typography,
} from '@mui/material';
import ModalUnstyled from '@mui/base/ModalUnstyled';
import CloseIcon from '@mui/icons-material/Close';

const BackdropUnstyled = React.forwardRef((props, ref) => {
    const { open, className, ...other } = props;
    return (
      <div
        className={clsx({ 'MuiBackdrop-open': open }, className)}
        ref={ref}
        {...other}
      />
    );
  });
  
  BackdropUnstyled.propTypes = {
    className: PropTypes.string.isRequired,
    open: PropTypes.bool,
  };
  
  const Modal = styled(ModalUnstyled)`
    position: fixed;
    z-index: 1300;
    right: 0;
    bottom: 0;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  const Backdrop = styled(BackdropUnstyled)`
    z-index: -1;
    position: fixed;
    right: 0;
    bottom: 0;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    -webkit-tap-highlight-color: transparent;
  `;
  
  const style = (theme) => ({
    width: '70%',
    bgcolor: 'white',
    border: '1px solid currentColor',
    padding: '16px 32px 24px 32px',
  });

export default function Popup(props) {
    const { value, setOpen} = props;
    const { voterID, keyPair, } = value;

  return (
    <div>
        <Modal
            aria-labelledby="unstyled-modal-title"
            aria-describedby="unstyled-modal-description"
            open={true}
            //onClose={setOpen}
            slots={{ backdrop: Backdrop }}
        >
            <Container sx={style}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'end',
                    mb: 5
                }}>
                    <IconButton onClick={setOpen} sx={{
                        border: 'solid 1px'
                    }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Typography component='p' variant='h6' >
                    Wähler-ID: {voterID}
                </Typography>
                <Typography component='p' variant='h6' >
                    PubKey: {keyPair.publicKey}
                </Typography>
                <Typography component='p' variant='h6' >
                    PrivKey: {keyPair.privateKey}
                </Typography>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'end'
                }}>
                    <Button variant='contained' size='large'sx={{
                        //border: 'solid 1px'
                        width: 200,
                        mt:5
                    }} >
                        Herunterladen
                    </Button>
                   
                </Box>
            </Container>
        </Modal>
  </div>
  )
}
