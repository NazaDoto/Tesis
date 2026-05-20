<template>
  <motion.div class="auth-page">
    <LoadingOverlay :show="cargando" text="Registrando..." />
    <motion.div v-if="mensajePopup" class="mensaje-container-fondo">
      <motion.div class="mensaje-container">
        <span class="mensaje">{{ mensaje }}</span>
        <button class="btn-mensaje" type="button" @click="mensajePopup = false; mensaje = ''">Ok</button>
      </motion.div>
    </motion.div>

    <form class="auth-form auth-form--wide" @submit.prevent="registrar">
      <h1 class="auth-titulo">Registro de usuario</h1>

      <motion.div class="auth-card">
        <div class="auth-fields-grid">
          <motion.div class="auth-field">
            <label class="form-label" for="reg-usuario">Nombre de usuario</label>
            <input
              id="reg-usuario"
              class="form-control"
              type="text"
              v-model="usuario.usuario"
              required
              autocomplete="username"
              @input="restrictInput"
            />
          </motion.div>
          <motion.div class="auth-field">
            <label class="form-label" for="reg-correo">Correo</label>
            <input
              id="reg-correo"
              class="form-control"
              type="email"
              v-model="usuario.correo"
              autocomplete="email"
            />
          </motion.div>
          <motion.div class="auth-field auth-field--full">
            <label class="form-label" for="reg-dni">DNI</label>
            <input
              id="reg-dni"
              class="form-control"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              v-model="usuario.dni"
              autocomplete="off"
            />
          </motion.div>
          <motion.div class="auth-field">
            <label class="form-label" for="reg-password">Contraseña</label>
            <input
              id="reg-password"
              class="form-control"
              type="password"
              v-model="usuario.contraseña"
              required
              autocomplete="new-password"
            />
          </motion.div>
          <motion.div class="auth-field">
            <label class="form-label" for="reg-password2">Repetir contraseña</label>
            <input
              id="reg-password2"
              class="form-control"
              type="password"
              v-model="contraseña_repetida"
              required
              autocomplete="new-password"
            />
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div class="auth-actions">
        <button type="submit" class="btn btn-entrar auth-submit">Registrar</button>
      </motion.div>

      <motion.div class="auth-link-wrap">
        <router-link to="/login">¿Ya tenés cuenta? Ingresá</router-link>
      </motion.div>
    </form>
  </motion.div>
</template>

<script>
import router from '@/router';
import axios from 'axios';

export default {
  data() {
    return {
      mensajePopup: false,
      mensaje: '',
      contraseña_repetida: '',
      usuario: {
        correo: '',
        usuario: '',
        contraseña: '',
        dni: '',
      },
      cargando: false,
    };
  },
  methods: {
    restrictInput(event) {
      const input = event.target.value;
      const restrictedChars = /[\s!@#$%^&*()_+=[\]{};':"\\|,<>?`´¨~¡/°¬¿]/g;
      if (restrictedChars.test(input)) {
        this.usuario.usuario = this.usuario.usuario.slice(0, -1);
      }
    },
    async registrar() {
      if (this.usuario.contraseña !== this.contraseña_repetida) {
        this.mostrarMensaje('Las contraseñas no coinciden.');
        return;
      }
      this.cargando = true;
      try {
        await axios.post('/auth/register', this.usuario);
        router.push('/login');
      } catch (error) {
        this.mostrarMensaje(error.response?.data?.message || 'Error al registrar');
      } finally {
        this.cargando = false;
      }
    },
    mostrarMensaje(texto) {
      this.mensaje = texto;
      this.mensajePopup = true;
    },
  },
};
</script>

<style scoped>
@import './auth-shared.css';
</style>
