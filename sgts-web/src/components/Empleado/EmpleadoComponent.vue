<template>
  <div class="flex-inline">
    <SidebarEmpleadoComponent />
    <router-view class="vista"></router-view>
  </div>
</template>

<script>
import SidebarEmpleadoComponent from './SidebarEmpleadoComponent.vue';
import {io} from 'socket.io-client';

export default {
  components: {
    SidebarEmpleadoComponent,
  },
  mounted() {
    // 1. Pedir permiso para notificaciones
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permiso) => {
          console.log("Permiso de notificación:", permiso);
        });
      }
    }

    // 2. Conectar con el backend (socket.io)
    const socket = io("https://nazadoto.com:3500");

    // 3. Escuchar evento de nuevas solicitudes
    socket.on("nueva_solicitud", (data) => {
      console.log("Nueva solicitud:", data);
      this.mostrarNotificacion(data);
    });
  },
  methods: {
    mostrarNotificacion(data) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Nueva Solicitud", {
          body: `De: ${data.nombre} - ${data.detalle}`,
          icon: "/recursos/icono-noti.png", // opcional
        });
      } else {
        console.log("Notificaciones no permitidas por el usuario");
      }
    }
  }
}
</script>

<style scoped>
.flex-inline {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  background-color: #3e3eab;
}
</style>
