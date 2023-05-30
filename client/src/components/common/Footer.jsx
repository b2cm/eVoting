import {
  Paper,
  Box,
  Button,
} from '@mui/material';
import { useLocation } from 'react-router-dom';

export default function Footer(props) {
  const { isActive, handleCreateNewVote, handleCancelVoting } = props;
  const location = useLocation();
  const isVoteCockpitComponent = location.pathname.startsWith('/admin/vote/cockpit');
  const isCreateVoteComponent = location.pathname.startsWith('/admin/vote/create');

  const handleCreateNewVote1 = () => {
    handleCreateNewVote();
  }
  
  return (
    <Paper
    component='footer'
    square variant="outlined"
        sx={{
          marginTop: 'calc(10% + 60px)!important',
          position: 'fixed',
          bottom: 0,
          width: '100%',
          height: '10vh',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          backgroundColor: '#F7F7F7',
          //border: '1px solid black'
        }}
      >
        {isActive && 
          <> 
            <Button 
              variant='contained' 
              size='large' 
              color="error"
              //style={{backgroundColor:'grey'}} 
              onClick={handleCancelVoting}
              sx={{
                marginRight:5, 
                width:200}}>
             {isCreateVoteComponent && 'Abbrechen'}
             {isVoteCockpitComponent && 'Wahl abbrechen'}
            </Button>
            <Button 
              variant='contained' 
              size='large' 
              onClick={handleCreateNewVote1}
              sx={{ 
                width:200, 
                marginRight: 3 
              }}>
              {isCreateVoteComponent && 'Erstellen'}
              {isVoteCockpitComponent && 'Änderungen speichern'}
            </Button>
          </>
        }
      </Paper>
  
  );
}

