<template>
  <motion.div class="auth-page">
    <LoadingOverlay :show="cargando" text="Ingresando..." />
    <motion.div v-if="mensajePopup" class="mensaje-container-fondo">
      <motion.div class="mensaje-container">
        <span class="mensaje">{{ mensaje }}</span>
        <button class="btn-mensaje" type="button" @click="mensajePopup = false; mensaje = ''">Ok</button>
      </motion.div>
    </motion.div>

    <form class="auth-form" @submit.prevent="login">
      <h1 class="auth-titulo">Iniciar sesión</h1>

      <motion.div class="auth-card">
        <motion.div class="auth-field">
          <label class="form-label" for="login-usuario">Usuario</label>
          <input
            id="login-usuario"
            class="form-control"
            type="text"
            v-model="usuario.usuario"
            required
            autocomplete="username"
            @input="restrictInput"
          />
        </motion.div>
        <motion.div class="auth-field">
          <label class="form-label" for="login-password">Contraseña</label>
          <input
            id="login-password"
            class="form-control"
            type="password"
            v-model="usuario.contraseña"
            required
            autocomplete="current-password"
          />
        </motion.div>
      </motion.div>

      <motion.div class="auth-actions">
        <button type="submit" class="btn btn-entrar auth-submit">Entrar</button>
      </motion.div>

      <motion.div class="auth-link-wrap">
        <router-link to="/registrar">Crear cuenta</router-link>
      </motion.div>
    </form>
  </motion.div>
</template>

<script>
import axios from 'axios';
import router from '@/router';
import emitter from '@/eventBus';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export default {
  data() {
    return {
      mensajePopup: false,
      mensaje: '',
      usuario: {
        usuario: '',
        contraseña: '',
        rol: '',
      },
      cargando: false,
    };
  },

  mounted() {
    if (this.$route.query.msg === 'expirada') {
      toast('La sesión expiró. Volvé a ingresar.', {
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        theme: 'colored',
        hideProgressBar: true,
        position: 'top-right',
      });
    }
  },

  methods: {
    restrictInput(event) {
      const input = event.target.value;
      const restrictedChars = /[\s!@#$%^&*()_+=[\]{};':"\\|,<>?`´¨~¡/°¬¿]/g;
      if (restrictedChars.test(input)) {
        this.usuario.usuario = this.usuario.usuario.slice(0, -1);
      }
    },

    async login() {
      this.cargando = true;
      try {
        const response = await axios.post('/auth/login', this.usuario);

        const user = {
          usuario: this.usuario.usuario,
          dni: response.data.dni,
          rol: response.data.rol,
        };

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('auth_token', response.data.token);
        emitter.emit('usuarioLogueado');

        switch (user.rol) {
          case 0:
            router.push('/beneficiario');
            break;
          case 1:
            router.push('/empleado');
            break;
          case 2:
            router.push('/admin');
            break;
        }
      } catch (error) {
        this.mostrarMensaje(error.response?.data?.message || 'Error al iniciar sesión');
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
