import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import RoomPage from './RoomPage';
import WaitingScreen from './WaitingScreen';

const App = () => {

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