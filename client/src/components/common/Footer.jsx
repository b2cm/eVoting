import {
  Box,
  Button,
} from '@mui/material';
import { useLocation } from 'react-router-dom';

export default function Footer(props) {
  const { isActive, handleCreateNewVote, handleCancelVoting } = props;
  const location = useLocation();
  const isVoteCockpitComponent = location.pathname.startsWith('/vote/cockpit');
  const isCreateVoteComponent = location.pathname.startsWith('/vote/create');

  const handleCreateNewVote1 = () => {
    handleCreateNewVote();
  }
  
  return (
    <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          backgroundColor: '#F7F7F7',
          height: '10vh',
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
      </Box>
  
  );
}

