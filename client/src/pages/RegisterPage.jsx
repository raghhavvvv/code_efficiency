// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode } from '@fortawesome/free-solid-svg-icons';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    register({ username, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <FontAwesomeIcon icon={faCode} className="text-cyan-400 text-5xl mb-3" />
            <h1 className="text-3xl font-bold text-white">Coding Efficiency Tracker</h1>
            <p className="text-gray-400">Create your account to get started</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-semibold text-white text-center mb-6">Register</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="username">Username</label>
                <input
                  type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
                  required placeholder="Your cool username"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">Email</label>
                <input
                  type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
                  required placeholder="you@example.com"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">Password</label>
                <input
                  type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
                  required placeholder="••••••••"
                />
              </div>
              <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105">
                Create Account
              </button>
            </form>
            <p className="text-center text-gray-500 text-sm mt-6">
              Already have an account? <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">Login here</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;