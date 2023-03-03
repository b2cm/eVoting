import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import BallotPanel from './ballot/BallotPanel';
import BallotIcon from '@mui/icons-material/Ballot';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ElectionResults from '../admin-ui/DisplayVotingDetails/ElectionResults';
import { VOTING_STATES } from '../../utils/constantes';
import { VOTING_TAB_COLOR } from '../../utils/colors';
import VoteOverviewPanel from './VoteOverviewPanel';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`voting-tabpanel-${index}`}
      aria-labelledby={`voting-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          <Typography component='div'>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `voting-tab-${index}`,
    'aria-controls': `voting-tabpanel-${index}`,
  };
}

export default function VotingTabs(props) {
  
  const { 
    tabValue,
    setTabValue, 
    isEditable, 
    ballots, 
    setBallots, 
    voteStart, 
    setVoteStart, 
    voteEnd, 
    setVoteEnd, 
    voteName, 
    setVoteName, 
    voteID,
    setVoteID, 
    voteState,
    ballots_to_add,
    setBallots_to_add, 
    ballots_to_delete,
    setBallots_to_delete,
    ballots_to_update,
    setBallots_to_update,
    whichBallots,
    setWhichBallots,
    admin
   } = props;

  const handleChangeTabValue = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ 
      width: '100%', 
      height: 700
      
    }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleChangeTabValue} aria-label="basic tabs"  >
          <Tab icon={<AssignmentIcon sx={{width: 25, height: 25}}/>} iconPosition='start' label="Übersicht" {...a11yProps(0)} style={{fontSize: 11, fontWeight: 600, paddingLeft: 0, color: VOTING_TAB_COLOR }} />
          <Tab icon={<BallotIcon sx={{width: 25, height: 25}}/>} iconPosition='start' label="Stimmzettel" {...a11yProps(1)} style={{fontSize: 11, fontWeight: 600, color: VOTING_TAB_COLOR}} />
          {voteState === VOTING_STATES[2] && <Tab icon={<AssignmentTurnedInIcon sx={{width: 25, height: 25}}/>} iconPosition='start' label="Ergebnisse" {...a11yProps(2)} style={{fontSize: 11, fontWeight: 600, color: VOTING_TAB_COLOR}}/>}
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0} >
        <VoteOverviewPanel
          isEditable={isEditable}
          ballots={ballots}
          voteName={voteName}
          setVoteName={setVoteName}
          voteID={voteID}
          setVoteID={setVoteID}
          voteStart={voteStart}
          setVoteStart={setVoteStart}
          voteEnd={voteEnd}
          setVoteEnd={setVoteEnd}
          admin={admin}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={1} >
        <BallotPanel 
          ballots={ballots} 
          setBallots={setBallots} 
          isEditable={isEditable}
          ballots_to_add={ballots_to_add}
          setBallots_to_add={setBallots_to_add}
          ballots_to_delete={ballots_to_delete}
          setBallots_to_delete={setBallots_to_delete}
          ballots_to_update={ballots_to_update}
          setBallots_to_update={setBallots_to_update}
          whichBallots={whichBallots}
          setWhichBallots={setWhichBallots}
        />
      </TabPanel>
      {voteState === VOTING_STATES[2] && 
        <TabPanel value={tabValue} index={2} >
          <ElectionResults />
        </TabPanel>
      }

    </Box>
  );
}