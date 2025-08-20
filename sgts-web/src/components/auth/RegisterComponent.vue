<template>
    <div>
        <div v-if="cargando" class="pantalla-carga text-center">
            <div class="logo-carga">
                <img class="logo-img" src="/favicon.ico" width="50" alt="Logo" />
                <div class="texto-carga">Registrando...</div>
            </div>
        </div>
        <div v-if="mensajePopup" class="mensaje-container-fondo">
            <div class="mensaje-container">
                <span class="mensaje">{{ mensaje }}</span>
                <button class="btn-mensaje" @click="this.mensajePopup = false; this.mensaje = ''">Ok</button>

            </div>
        </div>

        <div class="total text-center">
            <form @submit.prevent="registrar" class="flex-container">
                <h2 class="titulo mt-4">Registro de Usuario</h2>
                <div class="form-container">
                    <div class="row">
                        <div class="col-md-6">
                            <label class="form-label" for="usuario">Nombre de Usuario</label>
                            <input class="form-control" id="usuario" type="text" v-model="usuario.usuario" required
                                @input="restrictInput" />
                        </div>
                        <div class="col-md-6">
                            <label class="form-label" for="correo">Correo</label>
                            <input class="form-control" id="correo" type="email" v-model="usuario.correo">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <label for="dni" class="form-label">DNI</label>
                            <input class="form-control" id="dni" type="number" v-model="usuario.dni">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <label class="form-label" for="contraseña">Contraseña</label>
                            <input class="form-control" id="contraseña" type="password" v-model="usuario.contraseña" required />
                        </div>
                        <div class="col-md-6">
                            <label class="form-label" for="contraseña2">Repetir Contraseña</label>
                            <input class="form-control" id="contraseña2" type="password" v-model="contraseña_repetida" required />
                        </div>
                    </div>
                </div>
                <div class="btn-container">
                    <button type="submit" class="btn-mensaje">Registrar</button>
                </div>
                <div class="col-md-12 mt-4">
                    <router-link to="/login">¿Ya tenés cuenta? Ingresá</router-link>
                </div>
            </form>
        </div>
    </div>
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
        async registrar() {
            if (this.usuario.contraseña == this.contraseña_repetida) {
                this.cargando = true;
                try {
                    await axios.post('/auth/register', this.usuario);
                    router.push('/login');
                } catch (error) {
                    this.mostrarMensaje(error.response.data.message);
                } finally {
                    this.cargando = false;
                }

            } else {
                this.mostrarMensaje('Las contraseñas no coinciden.');
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

.pantalla-carga {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: rgba(255, 255, 255, 0.9);
}

.logo-carga {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.texto-carga {
    font-size: 1.2rem;
    font-weight: bold;
    margin-top: 10px;
}

.form-container {
    display:flex;
  flex-direction: column;
  gap:10px;
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

.btn-container {
    display: flex;
    justify-content: center;
    margin-top: 15px;
}



@media screen and (max-width: 768px) {
    .form-container {
        width: 90%;
    }
}
</style>