import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route } from "react-router-dom";
import Home from './components/home/home';
import GameRoom from './components/game-room/game_room';

const App = () => {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:roomId" element={<GameRoom />} />
      </Routes>
    </>
  );
};

export default App;
