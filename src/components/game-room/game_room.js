import { collection, addDoc,query,onSnapshot,getDocs,doc,setDoc} from 'firebase/firestore';
import cardsApi from '../../services/cards_service';
import React, { useState, useEffect } from 'react';
import { Form, Button } from "react-bootstrap";
import Game from '../game-play/game_play';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import QRCode from 'qrcode.react';
import db from '../../firebase';
import './game_room.css';

const GameRoom = () => {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [joined, setJoined] = useState(false);

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  let [shuffledDeck, setShuffledDeck] = useState([]);
  
  useEffect(() => {
    if (timeLeft === 0) {
      // Move to the next player
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
      // Reset the timer
      setTimeLeft(30);
    } else {
      // Decrement the timer every second
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      // Clear the timer when the component unmounts
      return () => clearTimeout(timer);
    }
  }, [currentPlayerIndex, players.length, timeLeft]);
  

  useEffect(() => {
    if (!roomId || !joined) return;

    //get all the players that are within the room
    const playersRef = collection(db, 'rooms', roomId, 'players');
    const queryRef = query(playersRef);
    const unsubscribe = onSnapshot(queryRef, (snapshot) => {
      const newPlayers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(newPlayers);
    });
    return unsubscribe;
  }, [roomId, joined]);
  
  //add new player to the room
  const addNewPlayerToRoom = async (roomId, playerName) => {
    try {
      const playerRef = await addDoc(collection(db, `rooms/${roomId}/players`), {
        name: playerName,
        score: 0
      });
      const playerId = playerRef.id;
      await setDoc(doc(db, `rooms/${roomId}/players/${playerId}`), {
        playerId,
        name: playerName,
        score: 0
      });
      console.log(`Player ${playerName} added to room ${roomId}.`);
      return playerId;
    } catch (error) {
      console.error("Error adding player to room: ", error);
    }
  };
  
  const createRoom = async () => {
    try {
       await addNewPlayerToRoom(roomId, playerName);
      setJoined(true);
    } catch (error) {
      console.error("Error creating room: ", error);
    }
  };
  
  const joinRoom = async (roomId, playerName) => {
    try {
      //check if a player is already in the room, if it is then throw alert
      const querySnapshot = await getDocs(collection(db, `rooms/${roomId}/players`));
      const players = querySnapshot.docs.map(doc => doc.data());
      const playerExists = players.some(player => player.name === playerName);
  
      if (playerExists) {
        console.log(`Player ${playerName} already exists in room ${roomId}.`);
        alert("player already exist, use different name")
      } else {
          await addNewPlayerToRoom(roomId, playerName);
        setJoined(true);
        console.log(`Player ${playerName} joined room ${roomId}.`);
      }
    } catch (error) {
      console.error("Error joining room: ", error);
    }
  };
  
  const handleJoinRoomSubmit = (e) => {
    e.preventDefault();
    joinRoom(roomId, playerName);
    setRoomId(roomId);
  };

  const loadShuffledDeck = async () => {
    try {
      const getShuffledDeck = await cardsApi.getShuffledDeck();
      console.log(getShuffledDeck);
      setShuffledDeck(getShuffledDeck);
    } catch (error) {
      console.error('Error loading shuffled deck:', error);
      alert(error);
    }
  };
  
  return (
    <div>
      { joined ? (
        <>
        <Row>
            <Col>
            <h1>Game Room: {roomId}</h1>
            <div>
            <p>Share this QR code with your friends to join the game room:</p>
            <a href={`https://localhost:3000/game/${roomId}`}>
                 <QRCode value={`https://localhost:3000/game/${roomId}`} />
            </a>
            </div>
          <br></br>
          <Button onClick={loadShuffledDeck}>Shuffle Deck</Button>
            </Col>
            <Col>
            <h2>Players:</h2>
          <ul>
            {players.map((player) => (
              <li key={player.id}>{player.name} {player.score}  </li>
            ))}
          </ul>
          <div>
            <Game players={players} roomId={roomId}></Game>
          </div>
            </Col>
        </Row>
        </>
      ) : (
        <>
          <h1>Create or Join a Game Room</h1>
          <div className="form-content">
            <Form onSubmit={(e) => handleJoinRoomSubmit(e)}>
            <Form.Group className="mb-3" controlId="roomId">
                    <Form.Control
                        type="text"
                        placeholder="Room ID"
                        onChange={(e) => setRoomId(e.target.value)}
                        required
                    />
            </Form.Group>

            <Form.Group className="mb-3" controlId="name">
                    <Form.Control
                        type="text"
                        placeholder="Name"
                        onChange={(e) => setPlayerName(e.target.value)}
                        required
                    />
            </Form.Group>
                <div>
                <Button style={{ marginRight: '20px' }} type="submit">
                     Join Room
                </Button>
            <Button onClick={createRoom}>Create a Room</Button>
            </div>
            </Form>
            </div>
        </>
      )}
    </div>
  );
};

export default GameRoom;
