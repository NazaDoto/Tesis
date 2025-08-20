<template>
  <div class="modal-overlay" v-if="visible">
    <div class="modal-content">
      <button class="btn-cerrar" @click="$emit('cerrar')">✕</button>
      <h3>Datos de Tarjeta Social</h3>
      <form class="formulario-beneficiario">
        <div class="fila">
          <div class="w-5">
            <label>DNI</label>
            <input class="form-control" :value="form.dni" disabled />
          </div>
          <div class="w-5">
            <label>Número de Cuenta</label>
            <input class="form-control" :value="form.num_cuenta" disabled />
          </div>
        </div>
        <div class="fila">
          <div class="w-5">
            <label>Número de Tarjeta</label>
            <input class="form-control" :value="form.num_tarjeta" disabled />
          </div>
          <div class="w-5">
            <label>Fecha de Registro</label>
            <input class="form-control" :value="form.fecha_registro" disabled />
          </div>
        </div>
        <div class="fila">
          <div class="w-5">
            <label>Estado</label>
            <input class="form-control" :value="form.estado" disabled />
          </div>
          <div class="w-5">
            <label>Importe Acreditado</label>
            <input class="form-control" :value="form.importe_acreditado" disabled />
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    form: Object
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 600px;
  max-width: 90%;
  position: relative;
}
.btn-cerrar {
  position: absolute;
  right: 10px;
  top: 10px;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
}
</style>
