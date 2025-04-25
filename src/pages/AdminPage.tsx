import React from "react";
import LogoutButton from "../components/LogoutButton";

const AdminPage: React.FC = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin!</p>
      <LogoutButton />
    </div>
  );
};

export default AdminPage;
