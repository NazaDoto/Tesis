import { toast } from 'vue3-toastify';
import router from '@/router';

const TOAST_OPTS = {
  autoClose: 5000,
  closeOnClick: true,
  pauseOnHover: true,
  theme: 'colored',
  position: 'top-right',
};

/**
 * Pide permiso (debe llamarse desde un clic del usuario cuando sea posible).
 */
export async function solicitarPermisoNotificaciones() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export function permisoNotificaciones() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

/**
 * Toast en la app + notificación del sistema si el usuario lo permitió.
 */
export async function notificarSolicitudActualizada(data = {}) {
  const estado = data.estado || '';
  const cuerpo = data.observacion
    ? `Estado: ${estado}. ${data.observacion}`
    : `Tu solicitud ahora está en estado: ${estado}`;

  toast.info(cuerpo, {
    ...TOAST_OPTS,
    autoClose: 6000,
    onClick: () => {
      if (router.currentRoute.value.path !== '/beneficiario/solicitud') {
        router.push('/beneficiario/solicitud');
      }
    },
  });

  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  try {
    const notif = new Notification('Actualización de tu solicitud', {
      body: cuerpo,
      icon: '/favicon.ico',
      tag: `solicitud-actualizada-${data.dni}`,
    });
    notif.onclick = () => {
      window.focus();
      notif.close();
      router.push('/beneficiario/solicitud');
    };
  } catch (err) {
    console.warn('Notification API:', err);
  }
}

export async function notificarNuevaSolicitud(data = {}) {
  const nombre = data.nombre || 'Beneficiario';
  const dni = data.dni || '';
  const cuerpo = `${nombre} — DNI ${dni}`;

  toast.info(`Nueva solicitud: ${cuerpo}`, {
    ...TOAST_OPTS,
    onClick: () => {
      if (router.currentRoute.value.path !== '/empleado/solicitudes') {
        router.push('/empleado/solicitudes');
      }
    },
  });

  if (!('Notification' in window)) return;

  let permiso = Notification.permission;
  if (permiso === 'default') {
    return;
  }
  if (permiso !== 'granted') return;

  try {
    const notif = new Notification('Nueva solicitud de tarjeta', {
      body: cuerpo,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `nueva-solicitud-${dni}`,
      renotify: true,
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
      if (router.currentRoute.value.path !== '/empleado/solicitudes') {
        router.push('/empleado/solicitudes');
      }
    };
  } catch (err) {
    console.warn('No se pudo mostrar Notification API:', err);
  }
}
