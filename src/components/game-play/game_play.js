import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import cardsApi from "../../services/cards_service";
import { Button } from "react-bootstrap";
import db from "../../firebase";

const Game = ({ players, roomId }) => {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (gameOver) {
      // Determine the winner
      const highestScore = Math.max(...players.map((player) => player.score));
      const winningPlayers = players.filter(
        (player) => player.score === highestScore
      );
      // Check for a tie
      if (winningPlayers.length > 1) {
        setWinner(null);
        setShowAlert(true);
      } else {
        setWinner(winningPlayers[0]);
        setShowAlert(true);
      }
    } else if (timeLeft === 0) {
      // Move to the next player
      const nextPlayerIndex = currentPlayerIndex + 1;
      setCurrentPlayerIndex(nextPlayerIndex);
      // Reset the timer
      setTimeLeft(30);
      // Check if this is the last turn
      if (nextPlayerIndex === 0) {
        setGameOver(true);
      }
    } else {
      // Decrement the timer every second
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      // Clear the timer when the component unmounts
      return () => clearTimeout(timer);
    }
  }, [currentPlayerIndex, gameOver, players, timeLeft]);

  const handleNextTurn = async () => {
    // Move to the next player
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;

    // Update the score of the current player
    const drawCard = await cardsApi.drawAcard();
    setImageUrl(drawCard.cards[0]?.image);

    const cardValue = drawCard.cards[0]?.value;
    let score = 0;

    if (
      cardValue === "ACE" ||
      cardValue === "JACK" ||
      cardValue === "QUEEN" ||
      cardValue === "KING"
    ) {
      score = 10;
    } else {
      score = parseInt(cardValue);
    }

    // Update the current player's score
    const currentPlayerId = players[currentPlayerIndex].playerId;
    const playerRef = doc(db, `rooms/${roomId}/players/${currentPlayerId}`);
    await updateDoc(playerRef, { score: score });
    setCurrentPlayerIndex(nextPlayerIndex);

    // Reset the timer for the next player
    setTimeLeft(30);

    // Check if this is the last player's turn
    if (nextPlayerIndex === 0) {
      setGameOver(true);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  return (
    <div style={{ display: "inline-grid" }}>
      <p>
        It's {players[currentPlayerIndex]?.name}'s turn. Time left: {timeLeft}
      </p>
      <Button style={{ marginBottom: "20px" }} onClick={handleNextTurn}>
        draw card
      </Button>
      {winner && (
        <p>
          {winner.name} is the winner with a score of {winner.score}!
        </p>
      )}
      {showAlert && (
        <div>
          {winner ? (
            <p>
              Game over! {winner.name} wins with a score of {winner.score}!
            </p>
          ) : (
            <p>Game over! It's a tie!</p>
          )}
          <button onClick={handleAlertClose}>Close</button>
        </div>
      )}

      <>
        <img alt="" src={imageUrl}></img>
      </>
    </div>
  );
};

export default Game;
