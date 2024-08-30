import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from './socket';
import './roompage.scss';

const RoomPage = () => {
  const [name, setName] = useState('');
  const [chat, setChat] = useState('');
  const [roomInfo, setRoomInfo] = useState('');
  const chatWindowRef = useRef(null);
  const socketRef = useRef(null);
  const [gameState, setGameState] = useState({lobby: true, inGame: false, gameHero: false, gameObserver: false, gameLoser: false, gameCheck: false});
  const [userCard, setUserCard] = useState(null);
  const [remainingCards, setRemainingCards] = useState([]);
  const [scoreCard, setScoreCard] = useState([]);
  let selectedCards = [];
  const navigate = useNavigate();

  useEffect(() => {
    setName(sessionStorage.getItem('name'));
    setScoreCard(JSON.parse(sessionStorage.getItem('scoreCard')));
    console.log(scoreCard)
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('connected to server');
    });

    socket.on('disconnect', () => {
      console.log('disconnected from server');
    });

    socket.on('gamePlay', (data) => {
        setGameState(data.state);
        if (data.message) {
          appendMessage(data.message);
        }
        if (data.action && data.action === 'gameStart') {
          gameStart();
        }
        if (data.action && data.action === 'snap') {
          snapStart();
        }
        if (data.scoreCard) {
          setScoreCard(data.scoreCard);
        }
    });

    socket.on('chat', (data) => {
      appendMessage(data.message);
    });

    socket.on('playerJoined', (data) => {
      appendMessage(data.message);
      setScoreCard(data.scoreCard);
    });

    socket.on('roomJoined', (data) => {
      appendMessage(data.message);
      setScoreCard(data.scoreCard);
    });

    socket.on('receiveCards', ({ userCard, remainingCards }) => {
      receiveCards({ userCard, remainingCards });
    });

    return () => {
      socket.off('roomJoined');
      socket.off('roomCreated');
      socket.off('gamePlay');
      socket.off('chat');
      socket.off('receiveCards');
      socket.off('playerJoined');
    };
  }, []);

  const handleChat = () => {
    socketRef.current.emit('chat', { timestamp: Date.now(), name: name, chat: chat });
  };

  const handleLogOut = () => {
    socketRef.current.emit('action', { timestamp: Date.now(), name: name, action: 'logout' });
    navigate(`/`);
  };

  const handleReady = () => {
    socketRef.current.emit('action', { timestamp: Date.now(), name: name, action: 'ready' });
  };

  const handleSnap = () => {
    socketRef.current.emit('action', { timestamp: Date.now(), name: name, action: 'snap' });
  };

  const handleNoSnap = () => {
    socketRef.current.emit('action', { timestamp: Date.now(), name: name, action: 'noSnap' });
  };

  const handleCardSelect = (card, elementID) => {
    if (gameState.gameHero) {
      document.getElementById(elementID).style.backgroundColor = 'red';
      if (selectedCards[0] && selectedCards[0].elementID === elementID){
        document.getElementById(elementID).style.backgroundColor = 'aqua';
        selectedCards = [];
      } else if (selectedCards.length !== 0) {
        selectedCards.push({card: card, elementID: elementID});
        socketRef.current.emit('action', { timestamp: Date.now(), name: name, cards: selectedCards, action: 'cardSelect' });
        selectedCards = [];
      } else {
        selectedCards.push({card: card, elementID: elementID});
      }
    } else {
      return;
    }
  };

  const receiveCards = ({ userCard, remainingCards }) => {
    console.log(userCard, remainingCards);
    document.querySelectorAll('.otherCardsOverlay').forEach(element => {
      element.style.display = 'block';
    });
    document.querySelectorAll('.cardOption').forEach(element => {
      element.style.pointerEvents = 'auto';
      element.style.backgroundColor = 'aqua';
      element.style.opacity = '1';
    });
    setUserCard(userCard);
    setRemainingCards(remainingCards);
  };

  const gameStart = () => {
    document.querySelectorAll('.otherCardsOverlay').forEach(element => {
      element.style.display = 'none';
    });
  };

  const snapStart = () => {
    document.querySelectorAll('.cardOption').forEach(element => {
      element.style.pointerEvents = 'auto';
      element.style.opacity = '1';
    });
  };

  const appendMessage = (message) => {
    const chatWindow = chatWindowRef.current;
    if (chatWindow) {
      const p = document.createElement('p');
      p.id = `message_${Date.now()}`;
      p.textContent = typeof message === 'object' ? JSON.stringify(message) : message;
      if (chatWindow.firstChild) {
        chatWindow.insertBefore(p, chatWindow.firstChild);
      } else {
        chatWindow.appendChild(p);
      }
    }
  };

  return (
    <div className="App">
      <h1>Snap Game</h1>
      <h2>{roomInfo}</h2>
      <div className="scoreCard">
        <h3>Score Card</h3>
        {scoreCard ? Object.entries(scoreCard).map(([id, { name, score }]) => (
          <p key={id}>{name}: {score}</p>
        )) : ''}
      </div>
        <div className="mainViewport">
          <div className="chatbox">
            <input
              type="text"
              value={chat}
              onChange={(e) => setChat(e.target.value)}
              placeholder="Enter your message"
            />
            {gameState.lobby ? <button onClick={handleReady}>Ready</button>:''}
            {gameState.inGame ? <button onClick={handleSnap}>Snap</button>:''}
            {gameState.inGame ? <button onClick={handleNoSnap}>No Snap</button>:''}
            <button onClick={handleChat}>Chat</button>
            <button onClick={handleLogOut}>Log Out</button>
            <div ref={chatWindowRef} id="chat_window" style={{ border: '1px solid black', height: '200px',width: '300px', overflowY: 'scroll' }}>
            </div>
          </div>
          <div className="cardView">
            <div>
              <h3>Your Card</h3>
              {userCard ? <button onClick={() => {handleCardSelect(userCard.value, "userCard")}} id="userCard" className="userCard cardOption">{userCard.hint}</button>: ''}
            </div>
            <div>
              <h3>Remaining Cards</h3>
              {remainingCards ? remainingCards.map((card, index) => (
                <button onClick={() => {handleCardSelect(card.value, `otherCard-${index}`)}} id={"otherCard-" + index} className="otherCards cardOption" key={index}>
                  <div className="otherCardsOverlay"></div> 
                  <div className="cardClue">{card.hint}</div>
                </button>
              )) : ''}
            </div>
          </div>
        </div>
    </div>
  );
};

export default RoomPage;