import axios from 'axios';

const frontendApi = axios.create({
  baseURL: '/', // URL base del frontend
  timeout: 5000, // Tiempo de espera opcional
  headers: {
    'Content-Type': 'application/json',
  },
});

export default frontendApi;
