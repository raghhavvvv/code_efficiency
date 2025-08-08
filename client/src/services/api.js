// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001', // Your backend URL
  withCredentials: true, // This is crucial for sending cookies
});

export default api;