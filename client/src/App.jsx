import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { EthProvider } from "./contexts/EthContext";
import Login from "./components/voter/Login/Login";
import Header from "./components/common/Header";
import NewVote from "./components/admin/CreateNewVote/NewVote";
import { Toolbar } from "@mui/material";
import Home from "./components/admin/Home/Home";
import RegistrationPage from "./components/voter/Registration/RegistrationPage";
import LoadVotingsDetails from './components/admin/DisplayVotingDetails/LoadVotingDetails';
import Vote from './components/voter/Vote/Vote';
import OnboardingPage from './components/common/OnboardingPage';
import LoginAdmin from './components/admin/Home/LoginAdmin';
import ProtectedAdminRoutes from './components/admin/Home/ProtectedAdminRoutes';
import DisplayVote from './components/admin/DisplayVotingDetails/DisplayVote';




export default function App() {

  return (
    <EthProvider>
      
      <Router>
        <Header />
        <Toolbar />
        
        <Routes>
          <Route path="/" element={<OnboardingPage />} />
          <Route path='/admin/login' element={<LoginAdmin />} />
          
          <Route path='/admin/home' element={
            <ProtectedAdminRoutes>
              <Home />
            </ProtectedAdminRoutes>
          } />
          <Route path="/admin/vote/create" element={
            <ProtectedAdminRoutes>
              <NewVote />
            </ProtectedAdminRoutes>
          } />
          <Route path="/admin/vote/cockpit/:voteID" element={
            <ProtectedAdminRoutes>
              <DisplayVote />
            </ProtectedAdminRoutes>
          } /> 
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/vote/login/:voteID" element={<Login />} />
          <Route path="/vote/voting-cockpit/:voteID" element={<Vote />} />   
        </Routes> 
   
      </Router>

    </EthProvider>
  );
}

