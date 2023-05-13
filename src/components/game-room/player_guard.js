import Home from "../home/home";

const PlayerGuard = (props) => {
  const { playerName, roomExist, children } = props;
  if (!playerName || !roomExist) {
    return <Home />;
  }

  return children;
};

export default PlayerGuard;
