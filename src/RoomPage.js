import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from './socket';
import './roompage.scss';

const RoomPage = () => {
  const [name, setName] = useState('');
  const [chat, setChat] = useState('');
  const [roomInfo, setRoomInfo] = useState('');
  const chatWindowRef = useRef(null);
  const socketRef = useRef(null);
  const [snapCheck, setSnapCheck] = useState("none");
  const [snapPending, setSnapPending] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [readyOkay, setReadyOkay] = useState(false);
  const [snapOkay, setSnapOkay] = useState(false);
  const [userCard, setUserCard] = useState(null);
  const [remainingCards, setRemainingCards] = useState([]);

  useEffect(() => {
    socketRef.current = socket;

    socket.on('roomJoined', (data) => {
      setRoomInfo(`Room ID: ${data.roomId}, Settings: ${data.settings}`);
    });

    socket.on('roomCreated', (data) => {
      setRoomInfo(`Room ID: ${data.roomId}, Settings: ${data.settings}`);
    });

    socket.on('connect', () => {
      console.log('connected to server');
    });

    socket.on('disconnect', () => {
      console.log('disconnected from server');
    });

    socket.on('snapResponse', (data) => {
      appendMessage(data.message);
    });

    socket.on('snap', (data) => {
      appendMessage(data.message);
    });

    socket.on('readyResponse', (data) => {
      appendMessage(data.message);
    });

    socket.on('snapCalled', (data) => {
      appendMessage(data.message);
      setSnapPending(true);
    });

    socket.on('noSnapCalled', (data) => {
      appendMessage(data.message);
      setSnapPending(false);
      setGameStarted(false);
      setSnapOkay(false);
      setReadyOkay(true);
    });

    socket.on('snapSuccess', (data) => {
      appendMessage(data.message);
      setSnapPending(false);
      setGameStarted(false);
      setSnapOkay(false);
      setReadyOkay(true);
    });

    socket.on('snapFailed', (data) => {
      appendMessage(data.message);
      setSnapPending(false);
    });

    socket.on('noSnapFailed', (data) => {
      appendMessage(data.message);
      setSnapPending(false);
    });

    socket.on('readyOkay', (data) => {
      console.log('Room is ready to start!');
      setReadyOkay(true);
    });

    socket.on('ready', (data) => {
      appendMessage(data.message);
    });

    socket.on('chatResponse', (data) => {
      appendMessage(data.message);
    });

    socket.on('chat', (data) => {
      appendMessage(data.message);
    });

    socket.on('receiveCards', ({ userCard, remainingCards }) => {
      document.querySelectorAll('.otherCardsOverlay').forEach(element => {
        element.style.display = 'block';
      });
      document.querySelectorAll('.cardOption').forEach(element => {
        element.style.pointerEvents = 'auto';
        element.style.opacity = '1';
      });
      setUserCard(userCard);
      setRemainingCards(remainingCards);
    });

    socket.on('gameStarted', () => {
      setReadyOkay(false);
      setGameStarted(true);
      setTimeout(() => {
        document.querySelectorAll('.otherCardsOverlay').forEach(element => {
          element.style.display = 'none';
          setSnapOkay(true);
        });
      }, 3000);
    });

    return () => {
      socket.off('roomJoined');
      socket.off('readyOkay');
      socket.off('roomCreated');
      socket.off('ready');
      socket.off('snapCalled');
      socket.off('snapFailed');
      socket.off('snapSuccess');
      socket.off('snapResponse');
      socket.off('chatResponse');
      socket.off('chat');
      socket.off('receiveCards');
      socket.off('gameStarted');
      socket.off('noSnapCalled');
      socket.off('noSnapFailed');
      socket.off('snap');
    };
  }, []);

  const handleReady = () => {
    if (!gameStarted){
    socketRef.current.emit('ready', { timestamp: Date.now(), name: name });
    }
  };

  let interval;

  const handleSnap = () => {
    if (!snapPending) {
      setSnapPending(true);
      socketRef.current.emit('snapCalled', { timestamp: Date.now(), name: name });
      function countDown () {
        let time = 5;
        interval = setInterval(() => {
          appendMessage(` ${time}`);
          time--;
          console.log("time" + time);
          if (time === 0) {
            socketRef.current.emit('snapFailed', { timestamp: Date.now(), name: name });
            appendMessage("Failure!");
            setSnapCheck("none");
            setSnapPending(false);
            setSnapOkay(false);
            failedSnap();
            clearInterval(interval);
          }
        }, 1000);
      }
      countDown();
    }
  };

  const handleNoSnap = () => {
    if (!snapPending && !checkForMatchingCards()) {
      socketRef.current.emit('noSnapSuccess', { timestamp: Date.now(), name: name });
      setSnapPending(false);
      setGameStarted(false);
      setSnapOkay(false);
      setReadyOkay(true);
    } else {
      socketRef.current.emit('noSnapFailure', { timestamp: Date.now(), name: name });
    }
  };

  const checkForMatchingCards = () => {
    if (!userCard || !remainingCards) return false;
    const userCardMatch = remainingCards.some(card => card.value === userCard.value);
  
    const remainingCardsMatch = remainingCards.some((card, index) => 
      remainingCards.slice(index + 1).some(otherCard => otherCard.value === card.value)
    );
  
    return userCardMatch || remainingCardsMatch;
  };

  const handleChat = () => {
    socketRef.current.emit('chat', { timestamp: Date.now(), name: name, chat: chat });
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

  const checkSnap = (value) => {
    if (!snapPending) {
      if (snapCheck === "none") {
        setSnapCheck(value);
      } else if (snapCheck === value) {
        socketRef.current.emit('snapSuccess', { timestamp: Date.now(), name: name });
        appendMessage("Victory!");
        setSnapCheck("none");
        setSnapPending(false);
        setSnapOkay(false);
        setReadyOkay(true);
        setGameStarted(false);
        clearInterval(interval);
      } else {
        socketRef.current.emit('snapFailed', { timestamp: Date.now(), name: name });
        appendMessage("Failure!");
        setSnapCheck("none");
        setSnapPending(false);
        setSnapOkay(false);
        failedSnap();
        clearInterval(interval);
      }
    }
  };

  const failedSnap = () => {
    document.querySelectorAll('.cardOption').forEach(element => {
      element.style.pointerEvents = 'none';
      element.style.opacity = '0.5';
    });
  }


  return (
    <div className="App">
      <h1>Snap Game</h1>
      <h2>{roomInfo}</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        />
        <div className="mainViewport">
          <div className="chatbox">
            <input
              type="text"
              value={chat}
              onChange={(e) => setChat(e.target.value)}
              placeholder="Enter your message"
            />
            {readyOkay ? <button onClick={handleReady}>Ready</button>:''}
            {snapOkay && !snapPending ? <button onClick={handleSnap}>Snap</button>:''}
            {snapOkay && !snapPending ? <button onClick={handleNoSnap}>No Snap</button>:''}
            <button onClick={handleChat}>Chat</button>
            <div ref={chatWindowRef} id="chat_window" style={{ border: '1px solid black', height: '200px',width: '300px', overflowY: 'scroll' }}>
            </div>
          </div>
          <div className="cardView">
            <div>
              <h3>Your Card</h3>
              {userCard ? <button onClick={() => {checkSnap(userCard.value)}} className="userCard cardOption">{userCard ? userCard.hint: ""}</button>: ''}
            </div>
            <div>
              <h3>Remaining Cards</h3>
              {remainingCards.map((card, index) => (
                <button onClick={() => {checkSnap(card.value)}} className="otherCards cardOption" key={index}>
                  <div className="otherCardsOverlay"></div> 
                  <div className="cardClue">{card.hint}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
    </div>
  );
};

export default RoomPage;