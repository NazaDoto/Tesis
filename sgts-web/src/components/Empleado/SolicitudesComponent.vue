<template>
    <div class="vista">
        <!-- Pantalla de carga -->
        <LoadingOverlay :show="cargandoDatos" variant="dark" />

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

            <input class="form-control buscador" type="number" placeholder="Buscar por ID o DNI" v-model="buscar">

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
            <div class="solicitud-item" v-for="solicitud in solicitudesFiltradas" :key="solicitud.id">
                <span>{{ solicitud.id }}</span>
                <span>{{ solicitud.dni }}</span>
                <span>{{ formatearFecha(solicitud.fecha_solicitud) }}</span>
                <button type="button" class="btn btn-secundario"
                    :disabled="!solicitud.path_dni"
                    @click="abrirAdjunto(solicitud.path_dni)">
                    Ver
                </button>
                <button type="button" class="btn btn-secundario"
                    :disabled="!solicitud.path_historial_medico"
                    @click="abrirAdjunto(solicitud.path_historial_medico)">
                    Ver
                </button>
                <span class="estado" :class="estadoClass(solicitud.estado)">{{ solicitud.estado }}</span>
                <div class="acciones-solicitud">
                    <button type="button" class="btn btn-primario" @click="responder(solicitud)">Responder</button>
                    <button type="button" class="btn-eliminar-x" :disabled="cargandoDatos"
                        aria-label="Eliminar solicitud" title="Eliminar solicitud"
                        @click="confirmarEliminar(solicitud)">×</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import emitter from '@/eventBus';

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
            empleado: JSON.parse(localStorage.getItem('user') || '{}').usuario || 'desconocido',
        }
    },
    methods: {
        confirmarEliminar(solicitud) {
            const dni = solicitud.dni;
            const ok = window.confirm(
                `¿Eliminar la solicitud #${solicitud.id} y todos los datos del beneficiario DNI ${dni}?\n\n` +
                'Se borrarán: solicitud, beneficiario, tarjeta, historial, parientes y archivos adjuntos.\n' +
                'No se elimina la cuenta de usuario.'
            );
            if (ok) this.eliminarSolicitud(solicitud);
        },
        async eliminarSolicitud(solicitud) {
            this.cargandoDatos = true;
            try {
                const { data } = await axios.post('/tarjetas/eliminarSolicitud', {
                    id: solicitud.id,
                    empleado: this.empleado,
                });
                this.mensaje = data.mensaje || 'Solicitud eliminada correctamente.';
                this.mensajePopup = true;
                await this.fetchSolicitudes(true);
            } catch (error) {
                console.error(error);
                this.mensaje = error.response?.data?.error || 'No se pudo eliminar la solicitud.';
                this.mensajePopup = true;
            } finally {
                this.cargandoDatos = false;
            }
        },
        async responderSolicitud() {
            this.cargandoDatos = true;
            try {
                await axios.post('/tarjetas/actualizarSolicitud', { form: this.form });
                this.resetForm();
                await this.fetchSolicitudes(true);
            } catch (error) {
                console.log(error);
                this.mensaje = 'No se pudo guardar la solicitud.';
                this.mensajePopup = true;
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
        async fetchSolicitudes(silencioso = false) {
            if (!silencioso) this.cargandoDatos = true;
            try {
                const response = await axios.get('/tarjetas/getSolicitudes');
                this.solicitudes = response.data[0] || [];
            } catch (error) {
                console.error(error);
            } finally {
                if (!silencioso) this.cargandoDatos = false;
            }
        },
        onNuevaSolicitudRecibida() {
            this.fetchSolicitudes(true);
        },
        formatearFecha(fecha) {
            return new Date(fecha).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            })
        },
        async abrirAdjunto(storagePath) {
            if (!storagePath) return;
            try {
                const { data } = await axios.get('/get/descargar', {
                    params: { path: storagePath },
                    responseType: 'blob',
                });
                const url = URL.createObjectURL(data);
                window.open(url, '_blank', 'noopener,noreferrer');
                setTimeout(() => URL.revokeObjectURL(url), 120000);
            } catch (e) {
                console.error(e);
                this.mensaje = 'No se pudo abrir el archivo. Verifique su sesión o que el archivo exista.';
                this.mensajePopup = true;
            }
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
        emitter.on('nueva_solicitud', this.onNuevaSolicitudRecibida);
    },
    beforeUnmount() {
        emitter.off('nueva_solicitud', this.onNuevaSolicitudRecibida);
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
.btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

/* Estados (mismos colores que vista beneficiario / tarjeta) */
.estado {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.85rem;
}

.estado-solicitada {
    background: #e6f0ff;
    color: #0056d6;
}

.estado-pendiente {
    background: #fff5e0;
    color: #c77700;
}

.estado-entregada {
    background: #e8ffe6;
    color: #0d8a2d;
}

.estado-baja {
    background: #ffe6e6;
    color: #c70000;
}

/* Tabla */
.solicitud-encabezado,
.solicitud-item {
    display: grid;
    grid-template-columns: 0.4fr 1fr 1fr 0.7fr 0.9fr 1fr 1.1fr;
    text-align: center;
    align-items: center;
}

.acciones-solicitud {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: center;
    align-items: center;
}

.btn-eliminar-x {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    margin: 0;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #fff;
    color: #6b7280;
    font-size: 1.35rem;
    line-height: 1;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.btn-eliminar-x:hover:not(:disabled) {
    background: #fef2f2;
    border-color: #fca5a5;
    color: #dc2626;
}

.btn-eliminar-x:disabled {
    opacity: 0.45;
    cursor: not-allowed;
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

</style>
