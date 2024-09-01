import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from './socket';
import './homepage.scss';

const HomePage = () => {
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');
  const [animalsSetting, setAnimalsSetting] = useState(false);
  const [emotionsSetting, setEmotionsSetting] = useState(false);
  const [verbsSetting, setVerbsSetting] = useState(false);
  const navigate = useNavigate();

  const createRoom = () => {
    const roomSettings = {
      categories: {
      animals: animalsSetting,
      emotions: emotionsSetting,
      verbs: verbsSetting,
      }, 
      name: name,
    };
    sessionStorage.setItem('name', name);
    socket.emit('createRoom', roomSettings);
  };

  const joinRoom = () => {
    const joinSettings = {
      name: name,
      roomId: roomId,
    };
    sessionStorage.setItem('name', name);
    socket.emit('joinRoom', joinSettings);
  };

  useEffect(() => {
    socket.on('roomCreated', (data) => {
      sessionStorage.setItem('scoreCard', JSON.stringify(data));
      sessionStorage.setItem('roomId', data.roomId);
      navigate(`/room/${data.roomId}`);
    });

    socket.on('roomJoined', (data) => {
      console.log(data.scoreCard);
      sessionStorage.setItem('scoreCard', JSON.stringify(data));
      sessionStorage.setItem('roomId', data.roomId);
      navigate(`/room/${data.roomId}`);
    });

    socket.on('roomFull', (data) => {
      alert(data.message);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('roomFull');
    };
  }, [navigate]);

  return (
    <div id="homeScreen">
      <h1>Create or Join a Room</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        />
      <div>
        <h2>Create Room</h2>
        <label htmlFor="animalsSetting" style={{ marginRight: '10px', marginLeft: '10px' }}>
          Animals
        </label>
        <input
          type="checkbox"
          id="animalsSetting"
          checked={animalsSetting}
          onChange={(e) => setAnimalsSetting(e.target.checked)}
        />
        <label htmlFor="emotionsSetting" style={{ marginRight: '10px', marginLeft: '10px' }}>
          Emotions
        </label>
        <input
          type="checkbox"
          id="emotionsSetting"
          checked={emotionsSetting}
          onChange={(e) => setEmotionsSetting(e.target.checked)}
        />
        <label htmlFor="verbsSetting" style={{ marginRight: '10px', marginLeft: '10px' }}>
          Verbs
        </label>
        <input
          type="checkbox"
          id="verbsSetting"
          checked={verbsSetting}
          onChange={(e) => setVerbsSetting(e.target.checked)}
        />
        <button onClick={createRoom}>Create Room</button>
      </div>
      <div>
        <h2>Join Room</h2>
        <label htmlFor="roomId">Room ID:</label>
        <input
          type="text"
          id="roomId"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter room ID"
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
    </div>
  );
};

export default HomePage;