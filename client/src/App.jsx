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
import Foo from './components/common/Foo';
import ProtectedVoterRoutes from './components/voter/ProtectedVoterRoutes';
import { Logout } from './components/voter/Logout';




export default function App() {

  return (
    <EthProvider>
      
      <Router basename={`${process.env.PUBLIC_URL}`}>
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

          <Route path="/vote/voting-cockpit/:voteID" element={
              <ProtectedVoterRoutes>
                <Vote /> 
              </ProtectedVoterRoutes>
          } />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/vote/login/:voteID" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path='/logout' element={<Logout />} />
          <Route path="test" element={<Foo />} />  
        </Routes> 
   
      </Router>

    </EthProvider>
  );
}

/*
<Routes>
          <Route path={`${process.env.PUBLIC_URL}/`} element={<OnboardingPage />} />
          <Route path={`${process.env.PUBLIC_URL}/admin/login`} element={<LoginAdmin />} />
          
          <Route path={`${process.env.PUBLIC_URL}/admin/home`} element={
            <ProtectedAdminRoutes>
              <Home />
            </ProtectedAdminRoutes>
          } />
          <Route path={`${process.env.PUBLIC_URL}/admin/vote/create`} element={
            <ProtectedAdminRoutes>
              <NewVote />
            </ProtectedAdminRoutes>
          } />
          <Route path={`${process.env.PUBLIC_URL}/admin/vote/cockpit/:voteID`} element={
            <ProtectedAdminRoutes>
              <DisplayVote />
            </ProtectedAdminRoutes>
          } /> 
          <Route path={`${process.env.PUBLIC_URL}/registration`} element={<RegistrationPage />} />
          <Route path={`${process.env.PUBLIC_URL}/vote/login/:voteID`} element={<Login />} />
          <Route path={`${process.env.PUBLIC_URL}/login`} element={<Login />} />
          <Route path={`${process.env.PUBLIC_URL}/vote/voting-cockpit/:voteID`} element={<Vote />} />   
        </Routes>
*/

