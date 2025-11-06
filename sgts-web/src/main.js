import axios from 'axios';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import emitter from '@/eventBus';
const env = 'prod';

if (env === 'dev') {
  axios.defaults.baseURL = 'http://192.168.1.182:3500';
} else {
  axios.defaults.baseURL = 'https://nazadoto.com:3500';
}

// Creamos la instancia de la app primero
const app = createApp(App);

app.use(router);

// Interceptor de requests para agregar el token
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor de responses para manejar expiración de sesión
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      // Token expirado o no válido
      localStorage.clear();
      emitter.emit('usuarioDeslogueado');

      router.push({ path: '/login', query: { msg: 'expirada' }});

    }
    return Promise.reject(error);
  }
);

// Montamos la app
app.mount('#app');
