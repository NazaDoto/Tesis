<template>
  <div>
    <div v-if="cargando" class="pantalla-carga text-center">
      <div class="logo-carga">
        <img class="logo-img" src="/favicon.ico" width="50" alt="" />
        <div class="texto-carga">Ingresando</div>
      </div>
    </div>
    <div v-if="mensajePopup" class="mensaje-container-fondo">
      <div class="mensaje-container">
        <span class="mensaje">{{ mensaje }}</span>
        <button class="btn-mensaje" @click="this.mensajePopup = false; this.mensaje = ''">Ok</button>
      </div>
    </div>
    <div class="total text-center">
      <form class="flex-container" @submit.prevent="login">
        <h2 class="titulo mt-4">Iniciar Sesión</h2>
        <div class="form-container">
          <div class="row">
            <div class="col-md-12">
              <label class="form-label" for="usuario">Usuario</label>
              <input class="form-control" type="text" v-model="usuario.usuario" required @input="restrictInput" />
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <label class="form-label" for="contraseña">Contraseña</label>
              <input class="form-control" type="password" v-model="usuario.contraseña" required />
            </div>
          </div>
        </div>
        <div class="btn-container">
          <button type="submit" class="btn btn-entrar">Entrar</button>
        </div>
        <div class="col-md-12 mt-4">
          <router-link to="/registrar">Crear cuenta</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import router from '@/router';
import emitter from '@/eventBus';

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

    }
  },
  methods: {
    restrictInput(event) {
      const input = event.target.value;
      // Expresión regular para buscar espacios y ciertos símbolos
      const restrictedChars = /[\s!@#$%^&*()_+=[\]{};':"\\|,<>?`´¨~¡/°¬¿]/g;
      if (restrictedChars.test(input)) {
        this.usuario.usuario = this.usuario.usuario.substring(0, this.usuario.usuario.length - 1);
      }
    },
    async login() {
      this.cargando = true;
      let response;
      try {
        response = await axios.post('/auth/login', this.usuario);
        // Guardar el usuario en localStorage o en store

        const user = {usuario: this.usuario.usuario, dni: response.data.dni, rol: response.data.rol}
        localStorage.setItem('user', JSON.stringify(user));
        emitter.emit('usuarioLogueado'); // 🔥 emitir evento
        // Redirigir según rol
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
    }
  }
}
</script>

<style scoped>
.flex-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 600px;
  margin: auto;
}

.btn-container {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  background: white;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin: auto;
}

.titulo {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 15px;
}

label {
  color: black;
}

form {
  justify-content: center;
  width: 40vw;
  margin: auto;
}

.titulo {
  display: block;
}

.width-size {
  width: 30vw;
}

@media screen and (max-width: 992px) {
  form {
    width: auto;
  }

  .width-size {
    width: 80vw !important;
  }


  .fondo {
    width: 100vw;
  }
}
</style>