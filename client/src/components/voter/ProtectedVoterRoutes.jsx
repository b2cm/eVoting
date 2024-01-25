import React, { useEffect } from 'react';
import {
    useNavigate,
    useParams,
} from 'react-router-dom';
import { useEth } from '../../contexts/EthContext';

export default function ProtectedVoterRoutes({ children }) {
  const { voteID } = useParams();
    const { state } = useEth();
    const { isVoterAuthenticated } = state;
    const navigate = useNavigate();

    useEffect(() => {
      console.log('vote id', isVoterAuthenticated);
    })

   useEffect(() => {

    if ( !isVoterAuthenticated ) {
      return navigate(`/vote/login/${voteID}`);
    }
   }, [isVoterAuthenticated, navigate]);

  return ( children );
}