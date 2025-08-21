<template>
  <div class="vista">
    <div class="container">
      <h3 class="mt-2">Bienvenid@, {{ usuario.usuario?.toUpperCase() }}</h3>
      <p class="lead">Desde aquí podés acceder a las principales funciones de gestión del sistema.</p>

      <div class="tarjetas-inicio">
        <div class="card acceso" @click="$router.push('/empleado/solicitudes')">
          <h5>Gestión de Solicitudes</h5>
          <p>Evaluar, aprobar o rechazar solicitudes.</p>
        </div>
        <div class="card acceso" @click="$router.push('/empleado/beneficiarios')">
          <h5>Gestión de Beneficiarios</h5>
          <p>Agregar, modificar o buscar beneficiarios registrados.</p>
        </div>
        <div class="card acceso" @click="$router.push('/empleado/tarjetas')">
          <h5>Gestión de Tarjetas</h5>
          <p>Registrar y actualizar información de tarjetas sociales.</p>
        </div>
        <div class="card acceso" @click="$router.push('/empleado/informes')">
          <h5>Generar Informes</h5>
          <p>Obtener reportes de beneficiarios y tarjetas.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {io} from 'socket.io-client';
export default {
  data() {
    return {
      usuario: '',
    };
  },
  mounted() {
    this.usuario = JSON.parse(localStorage.getItem('user'));
    const socket = io("https://nazadoto.com:3500"); // ajusta la URL según tu server
  
    // 2. Escuchar evento de nuevas solicitudes
    socket.on("nueva_solicitud", (data) => {
      console.log("Nueva solicitud:", data);
      this.mostrarNotificacion(data);
    });
  },
};
</script>

<style scoped>
.tarjetas-inicio {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 30px;
}

.card.acceso {
  flex: 1 1 300px;
  background-color: #f1f1f1;
  padding: 20px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

.card.acceso:hover {
  background-color: #e0e0ff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.card.acceso h5 {
  margin-bottom: 10px;
  font-weight: bold;
}
</style>
