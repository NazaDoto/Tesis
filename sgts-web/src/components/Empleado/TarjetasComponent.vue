<template>
    <div class="vista">
        <div v-if="cargandoDatos" class="pantalla-carga-vista text-center">
            <div class="logo-carga">
                <img class="logo-img" src="/favicon.ico" width="50" alt="" />
                <div class="texto-carga">Cargando...</div>
            </div>
        </div>
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
                            @click="habilitarModificacion = true; habilitarImprimir = true;">Modificar Datos</button>
                    </div>
                </div>
                <div class="fila">
                    <div class="w-5">
                        <label for="num_cuenta" class="form-label">Número de Cuenta</label>
                        <input id="num_cuenta" class="form-control" v-model="form.num_cuenta" type="text"
                            :disabled="true" />
                    </div>
                    <div class="w-5">
                        <label for="num_tarjeta" class="form-label">Número de Tarjeta</label>
                        <input id="num_tarjeta" class="form-control" v-model="form.num_tarjeta" type="text"
                            :disabled="true" />
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
            },
            mensajePopup: false,
            mensaje: '',
            cargandoDatos: false,
            habilitarModificacion: false,

        };
    },
    methods: {
        async comprobarPadron() {
            this.cargandoDatos = true;

            try {
                const { data } = await axios.get('/tarjetas/getDatos', {
                    params: { dni: this.form.dni }
                });

                if (data && Object.keys(data).length > 0) {
                    for (const key in data) {
                        if (key in this.form && data[key] !== null && data[key] !== undefined) {
                            this.form[key] = data[key];
                        }
                    }
                    this.mostrarMensaje("Datos encontrados y cargados.");
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
            const ahora = new Date();
            const fechaHoy = ahora.toISOString().split('T')[0];

            if (!this.form.fecha_registro) this.form.fecha_registro = fechaHoy;
            this.form.fecha_modificacion = fechaHoy;

            try {
                const { data } = await axios.post('/tarjetas/update', this.form);
                if (data.success) {
                    this.mostrarMensaje("Tarjeta guardada correctamente.");
                } else {
                    this.mostrarMensaje("No se pudo guardar la tarjeta.");
                }
            } catch (err) {
                console.error(err);
                this.mostrarMensaje("Error al guardar la tarjeta.");
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