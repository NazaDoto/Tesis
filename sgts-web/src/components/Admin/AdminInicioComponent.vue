<template>
  <div class="vista">
    <div class="container">
      <h3 class="mt-2">Bienvenid@, {{ usuario.usuario?.toUpperCase() }}</h3>
      <p class="lead">Desde aquí podés acceder a las principales funciones de gestión del sistema.</p>

      <div class="tarjetas-inicio">
        <div class="card acceso" @click="$router.push('/admin/usuarios')">
          <h5>Gestionar Usuarios</h5>
          <p>Ver y modificar la información de los usuarios.</p>
        </div>
        <div class="card acceso" @click="$router.push('/admin/noticias')">
          <h5>Gestionar Noticias</h5>
          <p>Subir y modificar noticias.</p>
        </div>
        <div class="card acceso" @click="$router.push('/admin/logs')">
          <h5>Auditoría</h5>
          <p>Ver el registro de acciones de los usuarios.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      usuario: '',
    };
  },
  props: {
    tieneTarjeta: {
      type: String,
      default: null
    }
  },
  mounted() {
    this.usuario = JSON.parse(localStorage.getItem('user'));
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
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.card.acceso:hover {
  background-color: #e0e0ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card.acceso h5 {
  margin-bottom: 10px;
  font-weight: bold;
}
</style>
