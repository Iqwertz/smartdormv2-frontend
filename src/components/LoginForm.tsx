// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface LoginResponse {
  role: 'admin' | 'tenant';
}

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/login`,
        { username, password, keepLoggedIn },
        { withCredentials: true }
      );
      const { role } = response.data;
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'tenant') {
        navigate('/tenant');
      }
    } catch (error) {
      console.error('Login failed', error);
      // TODO: Show error message to user
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={keepLoggedIn}
            onChange={(e) => setKeepLoggedIn(e.target.checked)}
          />
          Keep me logged in
        </label>
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;