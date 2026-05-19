import { io } from 'socket.io-client';
import axios from 'axios';
import emitter from '@/eventBus';

let socket = null;

export function getSocketUrl() {
  return axios.defaults.baseURL || window.location.origin;
}

/**
 * Conexión única para empleados. Emite en eventBus: 'nueva_solicitud'.
 */
export function conectarSocketEmpleado() {
  if (socket?.connected) return socket;

  if (socket) {
    socket.connect();
    return socket;
  }

  socket = io(getSocketUrl(), {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.debug('[socket] conectado', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.debug('[socket] desconectado', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('[socket] error de conexión', err.message);
  });

  socket.on('nueva_solicitud', (data) => {
    emitter.emit('nueva_solicitud', data);
  });

  return socket;
}

export function desconectarSocketEmpleado() {
  if (!socket) return;
  socket.off('nueva_solicitud');
  socket.disconnect();
  socket = null;
}
