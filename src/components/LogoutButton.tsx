import { useAuth } from "../context/AuthContext";

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <button onClick={handleLogout} className="btn btn-danger">
      Logout
    </button>
  );
};

export default LogoutButton;
