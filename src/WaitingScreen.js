import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WaitingScreen = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 60000);

    const interval = setInterval(() => {
        setCountdown(prevCountdown => prevCountdown - 1);
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };

  }, [navigate]);

  return (
    <div>
      <h1>Servers sleeping at the moment, because this thing is running on free tier hosting - {countdown} seconds till wake up...</h1>
    </div>
  );
};

export default WaitingScreen;