// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // URL base del backend
  timeout: 5000, // Tiempo de espera opcional
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
