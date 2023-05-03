import { collection,query,onSnapshot} from 'firebase/firestore';
import cardsApi from '../../services/cards_service';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {  Button } from "react-bootstrap";
import Game from '../game-play/game_play';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import QRCode from 'qrcode.react';
import db from '../../firebase';
import './game_room.css';

const GameRoom = () => {
  
  const location = useLocation();
  const roomId = location.state.roomId;
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  const [shuffledDeck, setShuffledDeck] = useState([]);
  
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
    if (!roomId) return;
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
  }, [roomId]);
  
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
        <>
        <Row>
            <Col>
            <h1>Game Room: {roomId}</h1>
           
            <p className='ms-2'>Share this QR code with your friends to join the game room:</p>
            <div style={{textAlign:'center'}}>
            <a href={`https://localhost:3000/game/${roomId}`}>
                 <QRCode value={`https://localhost:3000/game/${roomId}`} />
            </a>
            <br></br>
            <Button className='mt-2' onClick={loadShuffledDeck}>Shuffle Deck</Button>
            </div>
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
  
    </div>
  );
};

export default GameRoom;
