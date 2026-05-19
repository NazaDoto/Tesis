<template>
  <div class="flex-inline">
    <SidebarEmpleadoComponent />

    <div
      v-if="mostrarAvisoNotificaciones"
      class="aviso-notificaciones"
    >
      <span>Recibí alertas cuando llegue una solicitud nueva.</span>
      <button type="button" class="btn-activar-noti" @click="activarNotificaciones">
        Activar notificaciones
      </button>
      <button type="button" class="btn-cerrar-aviso" aria-label="Cerrar" @click="cerrarAvisoNotificaciones">
        ✕
      </button>
    </div>

    <router-view class="vista"></router-view>
  </div>
</template>

<script>
import SidebarEmpleadoComponent from './SidebarEmpleadoComponent.vue';
import emitter from '@/eventBus';
import { conectarSocketEmpleado, desconectarSocketEmpleado } from '@/services/empleadoSocket';
import {
  notificarNuevaSolicitud,
  permisoNotificaciones,
  solicitarPermisoNotificaciones,
} from '@/utils/notificaciones';

export default {
  name: 'EmpleadoComponent',
  components: {
    SidebarEmpleadoComponent,
  },
  data() {
    return {
      mostrarAvisoNotificaciones: false,
    };
  },
  methods: {
    onNuevaSolicitud(data) {
      notificarNuevaSolicitud(data);
    },
    async activarNotificaciones() {
      const permiso = await solicitarPermisoNotificaciones();
      this.mostrarAvisoNotificaciones = permiso === 'default';
      if (permiso === 'granted') {
        try {
          new Notification('Alertas activadas', {
            body: 'Te avisaremos cuando llegue una nueva solicitud.',
            icon: '/favicon.ico',
          });
        } catch {
          /* ignorar */
        }
      }
    },
    cerrarAvisoNotificaciones() {
      this.mostrarAvisoNotificaciones = false;
      sessionStorage.setItem('sgts_aviso_noti_cerrado', '1');
    },
    actualizarAvisoNotificaciones() {
      if (sessionStorage.getItem('sgts_aviso_noti_cerrado')) {
        this.mostrarAvisoNotificaciones = false;
        return;
      }
      this.mostrarAvisoNotificaciones = permisoNotificaciones() === 'default';
    },
    onUsuarioDeslogueado() {
      desconectarSocketEmpleado();
    },
  },
  mounted() {
    conectarSocketEmpleado();
    this.actualizarAvisoNotificaciones();
    emitter.on('nueva_solicitud', this.onNuevaSolicitud);
    emitter.on('usuarioDeslogueado', this.onUsuarioDeslogueado);
  },
  beforeUnmount() {
    emitter.off('nueva_solicitud', this.onNuevaSolicitud);
    emitter.off('usuarioDeslogueado', this.onUsuarioDeslogueado);
    desconectarSocketEmpleado();
  },
};
</script>

<style scoped>
.flex-inline {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  background-color: #3e3eab;
  position: relative;
}

.aviso-notificaciones {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 1500;
  max-width: min(420px, calc(100vw - 32px));
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #fff;
  color: #1f2937;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  font-size: 0.9rem;
}

.btn-activar-noti {
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  background: #3e3eab;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.btn-activar-noti:hover {
  background: #2c2c87;
}

.btn-cerrar-aviso {
  margin-left: auto;
  border: none;
  background: transparent;
  font-size: 1.1rem;
  cursor: pointer;
  color: #6b7280;
  line-height: 1;
}

@media screen and (max-width: 992px) {
  .vista {
    width: calc(100%);
    margin-right: auto;
  }
}
</style>