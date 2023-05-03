import { collection, addDoc,getDocs,doc,setDoc} from 'firebase/firestore';
import { Form, Button } from "react-bootstrap";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import db from '../../firebase';
import './home.css';
const Home = () =>{

    const [roomId, setRoomId] = useState('');

    const [playerName, setPlayerName] = useState('');

    const navigate = useNavigate();

    const createRoom = async () => {
        try {
           await addNewPlayerToRoom(roomId, playerName);
           navigate(`/game_room/${roomId}`, { state: { roomId: roomId }});
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
              navigate(`/game_room/${roomId}`, { state: { roomId: roomId }});
            console.log(`Player ${playerName} joined room ${roomId}.`);
          }
        } catch (error) {
          console.error("Error joining room: ", error);
        }
      };
      
    const handleJoinRoomSubmit = (e) => {
        e.preventDefault();
        joinRoom(roomId, playerName).then(setRoomId(roomId));
      };

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
    return(
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
    )
}

export default Home;