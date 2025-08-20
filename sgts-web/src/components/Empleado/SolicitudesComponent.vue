<template>
    <div class="vista">
        <!-- Pantalla de carga -->
        <div v-if="cargandoDatos" class="pantalla-carga-vista">
            <div class="logo-carga">
                <img class="logo-img" src="/favicon.ico" width="50" alt="" />
                <div class="texto-carga">Cargando...</div>
            </div>
        </div>

        <!-- Popup de mensaje -->
        <div v-if="mensajePopup" class="mensaje-container-fondo">
            <div class="mensaje-container">
                <span class="mensaje">{{ mensaje }}</span>
                <button class="btn btn-primario" @click="mensajePopup = false; mensaje = ''">Ok</button>
            </div>
        </div>

        <!-- Modal de responder solicitud -->
        <div v-if="form_solicitud" class="form-solicitud-bg" @click="resetForm">
            <form @submit.prevent="responderSolicitud" @click.stop class="form-solicitud-container">
                <h3 class="titulo-form">Responder Solicitud</h3>

                <label for="id">ID</label>
                <input type="text" id="id" v-model="form.id" disabled class="form-control">

                <label for="dni">DNI</label>
                <input type="text" id="dni" v-model="form.dni" disabled class="form-control">

                <label for="estado" class="form-label">Estado</label>
                <select id="estado" class="form-select" v-model="form.estado">
                    <option disabled value="default">Seleccione</option>
                    <option value="SOLICITADA">Solicitada</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="ENTREGADA">Entregada</option>
                    <option value="BAJA">Baja</option>
                </select>

                <label for="observacion" class="form-label">Observación</label>
                <input type="text" id="observacion" class="form-control" v-model="form.observacion">

                <button class="btn btn-primario" type="submit">Guardar</button>
            </form>
        </div>

        <!-- Contenido principal -->
        <div class="container">
            <h3 class="titulo-pagina">Gestionar Solicitudes</h3>

            <input class="form-control buscador" type="number" placeholder="Buscar por ID o DNI" v-model="buscar"
                @change="filtrarSolicitudes">

            <!-- Encabezado de tabla -->
            <div class="solicitud-encabezado">
                <span>ID</span>
                <span>DNI</span>
                <span>Fecha</span>
                <span>Foto DNI</span>
                <span>Historial Médico</span>
                <span>Estado</span>
                <span>Acción</span>
            </div>

            <!-- Items -->
            <div class="solicitud-item" v-for="(solicitud, index) in solicitudesFiltradas" :key="index">
                <span>{{ solicitud.id }}</span>
                <span>{{ solicitud.dni }}</span>
                <span>{{ formatearFecha(solicitud.fecha_solicitud) }}</span>
                <a class="btn btn-secundario"
                    :href="('http://192.168.1.182:3000/get/descargar?path=' + solicitud.path_dni)">
                    Ver
                </a>
                <a class="btn btn-secundario"
                    :href="('http://192.168.1.182:3000/get/descargar?path=' + solicitud.path_historial_medico)">
                    Ver
                </a>
                <span :class="estadoClass(solicitud.estado)">{{ solicitud.estado }}</span>
                <a class="btn btn-primario" @click="responder(solicitud)">Responder</a>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            cargandoDatos: false,
            mensajePopup: false,
            form_solicitud: false,
            form: {
                id: '',
                dni: '',
                estado: 'default',
                observacion: '',
            },
            mensaje: '',
            solicitudes: [],
            buscar: '',
        }
    },
    methods: {
        async responderSolicitud() {
            this.cargandoDatos = true;
            try {
                await axios.post('/tarjetas/actualizarSolicitud', { params: { form: this.form } });
                this.resetForm();
                this.fetchSolicitudes();
                this.filtrarSolicitudes();
            } catch (error) {
                console.log(error);
            } finally {
                this.cargandoDatos = false;
            }
        },
        resetForm() {
            this.form_solicitud = false;
            this.form = { id: '', dni: '', estado: 'default', observacion: '' };
        },
        responder(solicitud) {
            this.form_solicitud = true;
            this.form.id = solicitud.id;
            this.form.estado = solicitud.estado;
            this.form.dni = solicitud.dni;
        },
        async fetchSolicitudes() {
            this.cargandoDatos = true;
            try {
                const response = await axios.get('/tarjetas/getSolicitudes');
                this.solicitudes = response.data[0];
            } catch (error) {
                console.log(error);
            } finally {
                this.cargandoDatos = false;
            }
        },
        formatearFecha(fecha) {
            return new Date(fecha).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            })
        },
        filtrarSolicitudes() {
            const texto = this.buscar.toString().toLowerCase();
            this.solicitudesFiltradas = this.solicitudes.filter(s =>
                s.id.toString().includes(texto) ||
                s.dni.toString().includes(texto)
            );
        },
        estadoClass(estado) {
            return {
                'estado-pendiente': estado === 'PENDIENTE',
                'estado-entregada': estado === 'ENTREGADA',
                'estado-baja': estado === 'BAJA',
                'estado-solicitada': estado === 'SOLICITADA'
            }
        }
    },
    async mounted() {
        await this.fetchSolicitudes();
    },
    computed: {
        solicitudesFiltradas() {
            if (!this.buscar) return this.solicitudes;
            const texto = this.buscar.toString().toLowerCase();
            return this.solicitudes.filter(s =>
                s.id.toString().includes(texto) ||
                s.dni.toString().includes(texto)
            );
        },
    }
}
</script>

<style scoped>
/* General */
.titulo-pagina {
    margin: 1rem 0;
    font-size: 1.4rem;
    font-weight: bold;
    color: #111827;
}

/* Botones */
.btn {
    padding: 4px 12px;
    width: fit-content;
    border-radius: 6px;
    font-size: 0.9rem;
    text-align: center;
    margin: auto;
    cursor: pointer;
    transition: 0.2s;
    text-decoration: none;
}
.btn-primario {
    background: #2563eb;
    color: white;
}
.btn-primario:hover {
    background: #1d4ed8;
}
.btn-secundario {
    background: #e5e7eb;
    color: #111827;
}
.btn-secundario:hover {
    background: #d1d5db;
}

/* Estados */
.estado-pendiente {
    color: #b91c1c;
    font-weight: bold;
}
.estado-entregada {
    color: #065f46;
    font-weight: bold;
}
.estado-baja {
    color: #6b7280;
    font-weight: bold;
}
.estado-solicitada {
    color: #dad603;
    font-weight: bold;
}

/* Tabla */
.solicitud-encabezado,
.solicitud-item {
    display: grid;
    grid-template-columns: 0.4fr 1fr 1fr 0.7fr 0.9fr 1fr 0.7fr;
    text-align: center;
    align-items: center;
}

.solicitud-encabezado {
    background: #f3f4f6;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #d1d5db;
    padding: 0.75rem 1rem;
}

.solicitud-item {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #e5e7eb;
    transition: 0.2s;
}
.solicitud-item:hover {
    background-color: #f9fafb;
}

/* Formulario modal */
.form-solicitud-bg {
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.form-solicitud-container {
    width: 400px;
    max-width: 90%;
    background-color: #fff;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    gap: 15px;
}


/* Buscador */
.buscador {
    margin: 0.5rem 0 1rem;
}

/* Popup */
.mensaje-container-fondo {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
}
.mensaje-container {
    background: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
}
</style>
