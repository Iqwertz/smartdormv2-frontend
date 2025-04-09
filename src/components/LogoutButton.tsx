import { useAuth } from "../context/AuthContext";

const LogoutButton: React.FC = () => {
    const { logout } = useAuth();
    
    const handleLogout = async () => {
        await logout();
        // Optionally, redirect to the login page or show a message
    };
    
    return (
        <button onClick={handleLogout} className="btn btn-danger">
        Logout
        </button>
    );
    }

export default LogoutButton;