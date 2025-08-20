<template>
  <div class="flex-inline">
    <SidebarEmpleadoComponent />
    <router-view class="vista"></router-view>
  </div>
</template>

<script>
import SidebarEmpleadoComponent from './SidebarEmpleadoComponent.vue';
import { io } from "socket.io-client";

export default {
  components: {
    SidebarEmpleadoComponent,
  },
  mounted() {
    // 1. Conectar con el backend
    const socket = io("https://nazadoto.com:3500"); // ajusta la URL según tu server

    // 2. Escuchar evento de nuevas solicitudes
    socket.on("nueva_solicitud", (data) => {
      console.log("Nueva solicitud:", data);
      this.mostrarNotificacion(data);
    });
  },
  methods: {
    async mostrarNotificacion(data) {
      // Pedir permiso si no está concedido
      if (Notification.permission !== "granted") {
        await Notification.requestPermission();
      }

      // Mostrar notificación
      if (Notification.permission === "granted") {
        new Notification("Nueva solicitud de Tarjeta Social", {
          body: `${data.nombre} (DNI: ${data.dni}) ha realizado una solicitud.`,
          icon: "/img/icono-mds.png" // poné un ícono accesible desde tu app
        });
      }
    }
  }
}
</script>

<style scoped>
.flex-inline{
  display:flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  background-color: #3e3eab;
}
</style>
