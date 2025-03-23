// src/pages/Logout.tsx
import { useAuth } from "../context/authContext";

const Logout = () => {
  const { logoutUser } = useAuth();

  return <button onClick={logoutUser}>Logout</button>;
};

export default Logout;
