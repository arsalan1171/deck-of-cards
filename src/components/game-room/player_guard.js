import Home from "../home/home";

const PlayerGuard = (props) => {
  const { playerName, children } = props;

  if (!playerName) {
    return <Home />;
  }

  return children;
};

export default PlayerGuard;
