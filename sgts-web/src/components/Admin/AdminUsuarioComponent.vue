<template>
    <div class="vista">
        <!-- Pantalla de carga -->
        <div v-if="cargando" class="pantalla-carga text-center">
            <div class="logo-carga">
                <img class="logo-img" src="/favicon.ico" width="50" alt="Logo" />
                <div class="texto-carga">Cargando...</div>
            </div>
        </div>

        <!-- Popup mensaje -->
        <div v-if="mensajePopup" class="mensaje-container-fondo">
            <div class="mensaje-container">
                <span class="mensaje">{{ mensaje }}</span>
                <button class="btn-mensaje" @click="mensajePopup = false; mensaje = ''">
                    Ok
                </button>
            </div>
        </div>

        <!-- Tabla de usuarios -->
        <div class="container">
            <h3 class="mt-2">Gestión de Usuarios</h3>

            <table class="tabla-usuarios">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Correo</th>
                        <th>DNI</th>
                        <th>Rol</th>
                        <th>Fecha Registro</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="u in usuarios" :key="u.id">
                        <td>{{ u.id }}</td>
                        <td>
                            <input v-model="u.usuario" class="input-tabla" />
                        </td>
                        <td>
                            <input v-model="u.correo" class="input-tabla" />
                        </td>
                        <td>
                            <input v-model="u.dni" class="input-tabla" />
                        </td>
                        <td>
                            <select v-model="u.rol" class="input-tabla">
                                <option value="0">Beneficiario</option>
                                <option value="1">Empleado</option>
                                <option value="2">Administrador</option>
                            </select>
                        </td>
                        <td>{{ formatearFecha(u.fecha_registro) }}</td>
                        <td>
                            <button class="btn-guardar" @click="guardarUsuario(u)">
                                Guardar
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    data() {
        return {
            cargando: false,
            mensajePopup: false,
            mensaje: "",
            usuarios: [],
        };
    },
    methods: {
        formatearFecha(fecha) {
      return new Date(fecha).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
    },
        async fetchUsuarios() {
            this.cargando = true;
            try {
                const res = await axios.get("/get/usuarios");
                this.usuarios = res.data[0];
            } catch (e) {
                this.mensaje = "Error al cargar usuarios." + e;
                this.mensajePopup = true;
            } finally {
                this.cargando = false;
            }
        },
        async guardarUsuario(usuario) {
            this.cargando = true;
            try {
                await axios.post("/beneficiarios/updateUsuario", {usuario: usuario});
                this.mensaje = "Usuario actualizado correctamente.";
                this.mensajePopup = true;
            } catch (e) {
                this.mensaje = "Error al actualizar usuario.";
                this.mensajePopup = true;
            }
            finally{
                this.cargando = false;
            }
        },
    },
    mounted() {
        this.fetchUsuarios();
    },
};
</script>

<style scoped>
/* Tabla */
.tabla-usuarios {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

.tabla-usuarios th,
.tabla-usuarios td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
}

.tabla-usuarios th {
    background: #3e3eab;
    color: #fff;
}

.input-tabla {
    width: 90%;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 6px;
}

.btn-guardar {
    background: #3e3eab;
    color: white;
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.btn-guardar:hover {
    background: #2c2c87;
}
</style>
