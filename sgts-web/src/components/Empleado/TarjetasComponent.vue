<template>
    <div class="vista">
        <LoadingOverlay :show="cargandoDatos" variant="dark" />
        <div v-if="mensajePopup" class="mensaje-container-fondo">
            <div class="mensaje-container">
                <span class="mensaje">{{ mensaje }}</span>
                <button class="btn-mensaje" @click="this.mensajePopup = false; this.mensaje = ''">Ok</button>

            </div>
        </div>
        <div class="container">
            <h3 class="mt-2">Datos de Tarjeta Social</h3>
            <form class="formulario-beneficiario" @submit.prevent="guardarTarjeta">
                <div class="fila">
                    <div class="w-5">
                        <label for="dni" class="form-label">DNI</label>
                        <input id="dni" class="form-control" v-model="form.dni" type="number"
                            @keydown.enter.prevent="comprobarPadron" />
                    </div>
                    <div class="w-5 mt-auto">
                        <button class="btn-mensaje" type="button" @click="comprobarPadron">Comprobar en padrón</button>
                    </div>
                </div>
                <div class="fila">
                    <div class="w-100"><button type="button" class="btn-tarjeta" :disabled="!botonModificacion"
                            @click="habilitarModificacion = true; habilitarImprimir = true;">Modificar datos</button>
                    </div>
                </div>
                <div class="fila">
                    <div class="w-5">
                        <label for="num_cuenta" class="form-label">Número de Cuenta</label>
                        <input id="num_cuenta" class="form-control" v-model="form.num_cuenta" type="text"
                            :disabled="!habilitarModificacion" />
                    </div>
                    <div class="w-5">
                        <label for="num_tarjeta" class="form-label">Número de Tarjeta</label>
                        <input id="num_tarjeta" class="form-control" v-model="form.num_tarjeta" type="text"
                            :disabled="!habilitarModificacion" />
                    </div>
                </div>

                <div class="fila">
                    <div class="w-5">
                        <label for="fecha_registro" class="form-label">Fecha de Registro</label>
                        <input id="fecha_registro" class="form-control" v-model="form.fecha_registro" type="date"
                            :disabled="true" />
                    </div>
                    <div class="w-5">
                        <label for="fecha_modificacion" class="form-label">Fecha de Modificación</label>
                        <input id="fecha_modificacion" class="form-control" v-model="form.fecha_modificacion" type="date"
                            :disabled="true" />
                    </div>
                </div>
                <div class="fila">

                    <div class="w-5">
                        <label for="estado" class="form-label">Estado</label>
                        <select id="estado" class="form-select" v-model="form.estado"
                            :disabled="!habilitarModificacion">
                            <option disabled value="">Seleccione</option>
                            <option value="SOLICITADA">Solicitada</option>
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="ENTREGADA">Entregada</option>
                            <option value="BAJA">Baja</option>
                        </select>
                    </div>
                    <div class="w-5">
                        <label for="importe_acreditado" class="form-label">Importe Acreditado</label>
                        <input id="importe_acreditado" class="form-control" v-model="form.importe_acreditado"
                            type="number" step="0.01" :disabled="!habilitarModificacion" />
                    </div>
                </div>

                <div class="fila">
                    <div class="w-100">
                        <label for="observaciones" class="form-label">Agregar Observación</label>
                        <input type="text" id="observaciones" class="form-control" v-model="form.observaciones" :disabled="!habilitarModificacion">
                    </div>
                    <div class="w-100" v-if="form.historias.length > 0">
                        <label for="historial" class="form-label">Historial</label>
                        <div class="historial">
                            <span class="w-100 block" v-for="(historia, index) in form.historias" :key="index">
                               <strong>{{ historia.fecha }}</strong> {{ historia.observaciones }}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="fila">
                    <button type="button" class="btn-mensaje btn-imprimir">Imprimir</button>
                    <button type="submit" class="btn-mensaje">Guardar</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            form: {
                dni: '',
                num_cuenta: '',
                num_tarjeta: '',
                fecha_registro: '',
                estado: '',
                fecha_modificacion: '',
                importe_acreditado: '',
                observaciones: '',
                historias: [],
                empleado: JSON.parse(localStorage.getItem('user')).usuario || 'desconocido',
            },
            mensajePopup: false,
            mensaje: '',
            cargandoDatos: false,
            habilitarModificacion: false,
            botonModificacion: false,
            habilitarImprimir: false,
        };
    },
    methods: {
        async comprobarPadron() {
            this.cargandoDatos = true;
            this.habilitarModificacion = false;

            try {
                const { data } = await axios.get('/tarjetas/getDatos', {
                    params: { dni: this.form.dni, empleado: '1' }
                });

                if (data && Object.keys(data).length > 0) {
                    for (const key in data) {
                        if (key.endsWith('_real')) continue;
                        if (key in this.form && data[key] !== null && data[key] !== undefined) {
                            this.form[key] = data[key];
                        }
                    }
                    this.form.num_cuenta = String(data.num_cuenta_real ?? data.num_cuenta ?? '').trim();
                    this.form.num_tarjeta = String(data.num_tarjeta_real ?? data.num_tarjeta ?? '').trim();
                    this.mostrarMensaje('Datos encontrados y cargados.');
                } else {
                    this.mostrarMensaje("No se encontraron datos para ese DNI.");
                }
            } catch (error) {
                console.error(error);
                this.mostrarMensaje("Ocurrió un error al consultar el padrón.");
            } finally {
                this.botonModificacion = true;
                this.cargandoDatos = false;
                this.habilitarImprimir = true;
            }
        },
        mostrarMensaje(mensaje) {
            this.mensajePopup = true;
            this.mensaje = mensaje;
        },
        async guardarTarjeta() {
            if (!this.form.dni) {
                this.mostrarMensaje('Ingrese un DNI y pulse "Comprobar en padrón" antes de guardar.');
                return;
            }
            if (this.form.estado === '' || this.form.estado === 'default') {
                this.mostrarMensaje('Seleccione un estado de tarjeta.');
                return;
            }
            const cuenta = String(this.form.num_cuenta || '').trim();
            if (!cuenta || /^X{4}-X{4}-X{4}-/i.test(cuenta)) {
                this.mostrarMensaje('Ingrese un número de cuenta válido.');
                return;
            }

            const ahora = new Date();
            const fechaHoy = ahora.toISOString().split('T')[0];

            if (!this.form.fecha_registro) this.form.fecha_registro = fechaHoy;
            this.form.fecha_modificacion = fechaHoy;

            this.cargandoDatos = true;
            try {
                const payload = {
                    dni: String(this.form.dni),
                    num_cuenta: cuenta,
                    num_tarjeta: String(this.form.num_tarjeta || '').trim(),
                    fecha_registro: this.form.fecha_registro,
                    estado: this.form.estado,
                    fecha_modificacion: this.form.fecha_modificacion,
                    importe_acreditado: this.form.importe_acreditado,
                    observaciones: this.form.observaciones || '',
                    empleado: this.form.empleado,
                };
                const { data } = await axios.post('/tarjetas/update', payload);
                if (data.success) {
                    this.mostrarMensaje('Tarjeta guardada correctamente.');
                    this.habilitarModificacion = false;
                    await this.comprobarPadron();
                } else {
                    this.mostrarMensaje('No se pudo guardar la tarjeta.');
                }
            } catch (err) {
                console.error(err);
                const msg = err.response?.data?.error || 'Error al guardar la tarjeta.';
                this.mostrarMensaje(msg);
            } finally {
                this.cargandoDatos = false;
            }
        }
    }

};
</script>
<style scoped>
.historial {
    max-height: 100px;
    overflow: auto;
    background-color: rgb(241, 241, 241);
    border-radius: 10px;
    padding: 5px;
}
.block{
    display:block;
}
input,
select {
    cursor: pointer;
}

.w-5 {
    width: calc(50% - 5px);
}

.w-3 {
    width: calc(33% - (20px / 3));
}

.formulario-beneficiario {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.fila {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

input,
select {
    padding: 6px;
    font-size: 0.9rem;
    flex: 1 1 200px;
}
</style>