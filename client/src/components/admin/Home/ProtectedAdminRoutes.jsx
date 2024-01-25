import React, { useEffect } from 'react';
import {
    useNavigate,
} from 'react-router-dom';
import { useEth } from '../../../contexts/EthContext';

export default function ProtectedAdminRoutes({ children }) {
    const { state } = useEth();
    const { isAdminAuthenticated, } = state;
    const navigate = useNavigate();

   useEffect(() => {
    if (!isAdminAuthenticated) {
        return navigate('/admin/login');
     }
   }, [isAdminAuthenticated, navigate]);

  return ( children );
}
