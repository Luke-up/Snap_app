import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import HomePage from './HomePage';
import RoomPage from './RoomPage';
import WaitingScreen from './WaitingScreen';

const App = () => {

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SOCKET_URL}/status`, { timeout: 5000 });
        if (response.status === 200) {
          navigate('/');
        }
      } catch (error) {
        navigate('/waiting');
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="/waiting" element={<WaitingScreen />} />
      </Routes>
    </Router>
  );
};

export default App;