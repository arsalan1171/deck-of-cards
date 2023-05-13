import { collection, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import cardsApi from "../../services/cards_service";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "react-bootstrap";
import PlayerGuard from "./player_guard";
import Game from "../game-play/game_play";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import QRCode from "qrcode.react";
import db from "../../firebase";
import "./game_room.css";

const GameRoom = () => {
  const { roomId } = useParams();
  const [players, setPlayers] = useState([]);
  const [shuffledDeck, setShuffledDeck] = useState([]);
  const [roomExist, setRoomExist] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    //get all the players that are within the room
    const playersRef = collection(db, "rooms", roomId, "players");
    const queryRef = query(playersRef);
    const unsubscribe = onSnapshot(queryRef, (snapshot) => {
      const newPlayers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
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
      console.error("Error loading shuffled deck:", error);
      alert(error);
    }
  };
  const playerName = localStorage.getItem("player");

  useEffect(() => {
    //check if the string obtained from url is a valid room existing in firebase
    const fetchRoom = async () => {
      try {
        const roomIds = window.location.pathname.substring(1);
        const room_id = roomIds !== "" ? roomIds : roomId;
        const roomRef = doc(db, `rooms/${room_id}`);
        const roomSnapshot = await getDoc(roomRef);
        if (!roomSnapshot.exists()) {
          console.log("room doesn't exist");
          setRoomExist(false);
        }
      } catch (error) {
        console.error("Error fetching room: ", error);
      }
    };
    fetchRoom();
  });

  return (
    <div>
      <>
        <PlayerGuard playerName={playerName} roomExist={roomExist}>
          <Row>
            <Col>
              <h1>Game Room: {roomId}</h1>
              <p className="ms-2">
                Share this QR code with your friends to join the game room:
              </p>
              <div style={{ textAlign: "center" }}>
                <a href={`https://localhost:3000/${roomId}`}>
                  <QRCode value={`https://localhost:3000/${roomId}`} />
                </a>
                <br></br>
                <Button className="mt-2" onClick={loadShuffledDeck}>
                  Shuffle Deck
                </Button>
              </div>
            </Col>
            <Col>
              <h2>Players:</h2>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Score</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id}>
                      <td>{player.name}</td>
                      <td>{player.score}</td>
                      <td>{player.isRoomCreator ? "creator" : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
                <Game players={players} roomId={roomId}></Game>
              </div>
            </Col>
          </Row>
        </PlayerGuard>
      </>
    </div>
  );
};

export default GameRoom;
