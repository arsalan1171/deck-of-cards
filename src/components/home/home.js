import { collection, addDoc, getDocs, doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import React, { useState } from "react";
import { nanoid } from "nanoid";
import db from "../../firebase";
import "./home.css";

const Home = () => {
  const [roomId, setRoomId] = useState(nanoid(7));

  const [playerName, setPlayerName] = useState("");

  const navigate = useNavigate();
  const createRoom = async () => {
    try {
      await addNewPlayerToRoom(roomId, playerName);
      navigate(`/${roomId}`);
    } catch (error) {
      console.error("Error creating room: ", error);
    }
  };

  const roomIds = window.location.pathname.substring(1);
  const joinRoom = async (roomId, playerName) => {
    try {
      //check if a player is already in the room, if it is then throw alert

      if (roomIds !== "") roomId = roomIds;

      const querySnapshot = await getDocs(
        collection(db, `rooms/${roomId}/players`)
      );
      const players = querySnapshot.docs.map((doc) => doc.data());
      const playerExists = players.some((player) => player.name === playerName);

      if (playerExists) {
        console.log(`Player ${playerName} already exists in room ${roomId}.`);
        alert("player already exist, use different name");
      } else {
        await addNewPlayerToRoom(roomId, playerName);

        console.log(`Player ${playerName} joined room ${roomId}.`);
      }
    } catch (error) {
      console.error("Error joining room: ", error);
    }
  };

  const handleJoinRoomSubmit = (e) => {
    e.preventDefault();
    setRoomId(nanoid());
    joinRoom(roomId, playerName);
  };

  //add new player to the room
  const addNewPlayerToRoom = async (roomId, playerName) => {
    try {
      const playerRef = await addDoc(
        collection(db, `rooms/${roomId}/players`),
        {
          name: playerName,
          score: 0,
        }
      );
      const playerId = playerRef.id;
      await setDoc(doc(db, `rooms/${roomId}`), {
        roomId: roomId,
        roomUrl: "https://localhost:3000/" + roomId,
      });
      await setDoc(doc(db, `rooms/${roomId}/players/${playerId}`), {
        playerId,
        name: playerName,
        score: 0,
      });
      localStorage.setItem("player", playerName);
      navigate(`/${roomId}`);
      console.log(`Player ${playerName} added to room ${roomId}.`);
      return playerId;
    } catch (error) {
      console.error("Error adding player to room: ", error);
    }
  };
  return (
    <>
      <h1>Create or Join a Game Room</h1>
      <div className="form-content">
        <Form onSubmit={(e) => handleJoinRoomSubmit(e)}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Control
              type="text"
              placeholder="Name"
              onChange={(e) => setPlayerName(e.target.value)}
              required
            />
          </Form.Group>
          <div>
            <Button style={{ marginRight: "20px" }} type="submit">
              Join Room
            </Button>
            <Button onClick={createRoom}>Create a Room</Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default Home;
