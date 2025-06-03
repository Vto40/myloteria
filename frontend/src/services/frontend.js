import axios from 'axios';

const frontendApi = axios.create({
  baseURL: '/', // URL base del frontend (puedes cambiarla si es necesario)
  timeout: 5000, // Tiempo de espera opcional
  headers: {
    'Content-Type': 'application/json',
  },
});

export default frontendApi;