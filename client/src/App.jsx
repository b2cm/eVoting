import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { EthProvider } from "./contexts/EthContext";
import Login from "./components/voter-ui/Login/Login";
import Header from "./components/common/Header";
import NewVote from "./components/admin-ui/CreateNewVote/NewVote";
import { Toolbar } from "@mui/material";
import Home from "./components/admin-ui/Home/Home";
import RegistrationPage from "./components/voter-ui/Registration/RegistrationPage";
import LoadVotingsDetails from './components/admin-ui/DisplayVotingDetails/LoadVotingDetails';




export default function App() {

  return (
    <EthProvider>
      
      <Router>
        <Header />
        <Toolbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/login/vote/:voteID" element={<Login />} />
          <Route path="/vote/create" element={<NewVote />} />
          <Route path="/vote/cockpit/:voteID" element={<LoadVotingsDetails/>} />      
        </Routes>  
      </Router>
     
     

    </EthProvider>
  );
}

