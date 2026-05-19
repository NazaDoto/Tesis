import { io } from 'socket.io-client';
import axios from 'axios';
import emitter from '@/eventBus';

let socket = null;

export function getSocketUrl() {
  return axios.defaults.baseURL || window.location.origin;
}

function registrarDniBeneficiario() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.dni && socket?.connected) {
      socket.emit('join_beneficiario', String(user.dni));
    }
  } catch {
    /* ignorar */
  }
}

/**
 * Conexión Socket.IO compartida (empleado + beneficiario).
 */
export function conectarRealtime() {
  if (socket?.connected) {
    registrarDniBeneficiario();
    return socket;
  }

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
    registrarDniBeneficiario();
  });

  socket.on('nueva_solicitud', (data) => {
    emitter.emit('nueva_solicitud', data);
  });

  socket.on('solicitud_actualizada', (data) => {
    emitter.emit('solicitud_actualizada', data);
  });

  return socket;
}

export function desconectarRealtime() {
  if (!socket) return;
  socket.off('nueva_solicitud');
  socket.off('solicitud_actualizada');
  socket.disconnect();
  socket = null;
}

/** @deprecated usar conectarRealtime */
export const conectarSocketEmpleado = conectarRealtime;

/** @deprecated usar desconectarRealtime */
export const desconectarSocketEmpleado = desconectarRealtime;
