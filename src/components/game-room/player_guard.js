import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PlayerGuard = (props) => {
  const { playerName, children } = props;
  const navigate = useNavigate();

  useEffect(() => {
    const checkPlayer = async () => {
      if (!playerName) {
        navigate("/");
      }
    };
    checkPlayer();
  }, [playerName, navigate]);

  return children;
};

export default PlayerGuard;
