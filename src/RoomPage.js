import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from './socket';
import './roompage.scss';

const INITIAL_GAME_STATE = {lobby: true, inGame: false, gameHero: false, gameObserver: false, gameLoser: false, gameCheck: false};
const SOLO_PLAYER_STATE = {lobby: false, inGame: false, gameHero: false, gameObserver: true, gameLoser: false, gameCheck: false};

const RoomPage = () => {
  const [name, setName] = useState('');
  const [chat, setChat] = useState('');
  const [roomInfo, setRoomInfo] = useState('');
  const chatWindowRef = useRef(null);
  const socketRef = useRef(null);
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [userCard, setUserCard] = useState(null);
  const [remainingCards, setRemainingCards] = useState([]);
  const [scoreCard, setScoreCard] = useState([]);
  const selectedCardsRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    setName(sessionStorage.getItem('name'));
    setRoomInfo(sessionStorage.getItem('roomId'));
    const newScoreCard = JSON.parse(sessionStorage.getItem('scoreCard') || '{}');
    setScoreCard(newScoreCard.scoreCard || []);
    socketRef.current = socket;
    if (newScoreCard.scoreCard && Object.keys(newScoreCard.scoreCard).length === 1){
      setGameState(SOLO_PLAYER_STATE);
    }

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
          if (Object.keys(data.scoreCard).length === 1){
            setGameState(SOLO_PLAYER_STATE);
          }
        }
        
    });

    socket.on('chat', (data) => {
      appendMessage(data.message);
    });

    socket.on('playerJoined', (data) => {
      appendMessage(data.message);
      setScoreCard(data.scoreCard);
      if (Object.keys(data.scoreCard).length > 1){
        setGameState(INITIAL_GAME_STATE);
      }
    });

    socket.on('roomJoined', (data) => {
      if (data.message) {
        appendMessage(data.message);
      }
      setScoreCard(data.scoreCard);
      if (Object.keys(data.scoreCard).length > 1){
        setGameState(INITIAL_GAME_STATE);
      }
    });

    socket.on('receiveCards', ({ userCard: incomingUserCard, remainingCards: incomingRemainingCards }) => {
      document.querySelectorAll('.cardOption').forEach(element => {
        element.style.opacity = '0';
        element.style.marginTop = '-50px';
      });
      setTimeout(() => {
        document.querySelectorAll('.otherCardsOverlay').forEach(element => {
          element.style.display = 'block';
        });
        document.querySelectorAll('.cardOption').forEach(element => {
          element.classList.remove('selected');
        });
        setUserCard(incomingUserCard);
        setRemainingCards(incomingRemainingCards);
      }, 400);
      setTimeout(() => {
        resizeFontSize();
      }, 500);
      setTimeout(() => {
        document.querySelectorAll('.cardOption').forEach(element => {
          element.style.opacity = '1';
          element.style.marginTop = '0';
        });
      }, 1000);
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

  const emitAction = (action, extra = {}) => {
    socketRef.current.emit('action', { timestamp: Date.now(), name, action, ...extra });
  };

  const handleChat = (event) => {
    event.preventDefault();
    const message = chat.trim();
    if (!message) {
      return;
    }
    socketRef.current.emit('chat', { timestamp: Date.now(), name, chat: message });
    setChat('');
  };

  const handleLogOut = () => {
    emitAction('logout');
    navigate(`/`);
  };

  const handleReady = () => {
    emitAction('ready');
  };

  const handleSnap = () => {
    emitAction('snap');
  };

  const handleNoSnap = () => {
    emitAction('noSnap');
  };

  const handleCardSelect = (card, elementID) => {
    if (!gameState.gameHero) {
      return;
    }

    const selectedCards = selectedCardsRef.current;
    const selectedElement = document.getElementById(elementID);
    if (!selectedElement) {
      return;
    }

    selectedElement.classList.add('selected');
    if (selectedCards[0] && selectedCards[0].elementID === elementID){
      selectedElement.classList.remove('selected');
      selectedCardsRef.current = [];
    } else if (selectedCards.length !== 0) {
      const updatedSelection = [...selectedCards, {card: card, elementID: elementID}];
      emitAction('cardSelect', { cards: updatedSelection });
      selectedCardsRef.current = [];
    } else {
      selectedCardsRef.current = [{card: card, elementID: elementID}];
    }
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

  const resizeFontSize = () => {
    document.querySelectorAll('.cardClue').forEach(element => {
      if (element.textContent.length <= 2) {
        element.style.fontSize = '40px';
      } else if (element.textContent.length === 3) {
        element.style.fontSize = '30px';
      } else if (element.textContent.length >= 6) {
        element.style.fontSize = '';
      } else {
        element.style.fontSize = '24px';
      }
    });
    document.querySelectorAll('.cardClueUser').forEach(element => {
      if (element.textContent.length <= 2) {
        element.style.fontSize = '60px';
      } else if (element.textContent.length === 3) {
        element.style.fontSize = '50px';
      } else if (element.textContent.length >= 6) {
        element.style.fontSize = '26px';
      } else {
        element.style.fontSize = '';
      }
    });
  };

  return (
    <div className="App">
      <div className="displayHeader">
        <h1>スナップゲーム</h1>
        <h2>room code = {roomInfo}</h2>
        <button onClick={handleLogOut}>バイバイ</button>
      </div>
      
      <div className="mainViewport">
        
        <div className="infoPanel">
          <div className="scoreCard">
            {scoreCard ? Object.entries(scoreCard).map(([id, { name, score }]) => (
              <p key={id}>{name}: {score}</p>
            )) : ''}
          </div>
          <div ref={chatWindowRef} id="chat_window" className="chatWindow"></div>
        </div>
        <div className="extraCards">
          <div className="extraCardsContainer">
            {remainingCards ? remainingCards.map((card, index) => (
              <button onClick={() => {handleCardSelect(card.value, `otherCard-${index}`)}} id={"otherCard-" + index} className="otherCards cardOption" key={index}>
                <div className="otherCardsOverlay"></div> 
                <div className="cardClue">{card.hint}</div>
              </button>
            )) : ''}
          </div>
        </div>
        <div className="ownCard">
          {userCard ? <button onClick={() => {handleCardSelect(userCard.value, "userCard")}} id="userCard" className="userCard cardOption"><p className="cardClueUser">{userCard.hint}</p></button>: ''}
        </div>

        <div className="gameControls">
          <div className="gameButtons">
            {gameState.lobby ? <button className="gameButton ready" onClick={handleReady}></button>:''}
            {gameState.inGame ? <button className="gameButton snap" onClick={handleSnap}></button>:''}
            {gameState.inGame ? <button className="gameButton noSnap" onClick={handleNoSnap}></button>:''} 
          </div>
          <div className="chatbox">
            <form onSubmit={handleChat}>
              <input
              type="text"
              value={chat}
              onChange={(e) => setChat(e.target.value)}
              placeholder="チャット"
              />
              <button type="submit"></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;