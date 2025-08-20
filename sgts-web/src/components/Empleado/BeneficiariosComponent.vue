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
        <div v-if="quitarArchivoMsgPopup" class="mensaje-container-fondo">
            <div class="mensaje-container">
                <span class="mensaje">¿Borrar archivo adjunto?</span>
                <span class="flex">
                    <button class="btn-mensaje" @click="quitarArchivo">Si, borrar</button>
                    <button class="btn-mensaje" @click="this.quitarArchivoMsgPopup = false">No</button>
                </span>
            </div>
        </div>
        <div class="container">
            <h3 class="mt-2">Datos de Beneficiario</h3>
            <form class="formulario-beneficiario" @submit.prevent="cargarBeneficiario">
                <div class="fila">
                    <div class="w-5">
                        <label for="dni" class="form-label">DNI</label>
                        <input id="dni" class="form-control" v-model="form.dni" type="number" required
                            @keydown.enter.prevent="comprobarPadron" />
                    </div>
                    <div class="btns-comprobar">
                        <button type="button" class="btn-mensaje" @click="comprobarPadron"
                            :disabled="form.dni == ''">Comprobar en padrón</button>
                        <button type="button" class="btn-tarjeta orange" @click="verTarjeta"
                            :disabled="!tieneTarjeta">Ver
                            Tarjeta</button>
                        <TarjetaModal :visible="modalVisible" :form="tarjetaForm" @cerrar="modalVisible = false">
                        </TarjetaModal>
                    </div>
                </div>
                <div class="fila">
                    <div class="w-100"><button type="button" class="btn-tarjeta" :disabled="!botonModificacion"
                            @click="habilitarModificacion = true; habilitarImprimir = true;">Modificar Datos</button>
                    </div>
                </div>
                <div class="fila">
                    <div class="w-5">
                        <label for="nombre" class="form-label">Nombre completo</label>
                        <input id="nombre" class="form-control" v-model="form.nombre" type="text"
                            :disabled="!habilitarModificacion" />
                    </div>
                    <div class="w-5">
                        <label for="cuil" class="form-label">CUIL</label>
                        <div class="input-group">
                            <!-- Prefijo editable (2 dígitos) -->
                            <input class="form-control text-center" maxlength="2" type="text" v-model="cuilInicio"
                                @input="updateCuil" :disabled="!habilitarModificacion" style="max-width: 3em;" />

                            <!-- DNI no editable -->
                            <span class="input-group-text">{{ form.dni }}</span>

                            <!-- Verificador editable (1 dígito) -->
                            <input class="form-control text-center" maxlength="1" type="text" v-model="cuilFin"
                                @input="updateCuil" :disabled="!habilitarModificacion" style="max-width: 3em;" />
                        </div>
                    </div>
                </div>
                <div class="fila">
                    <div class="w-3">
                        <label for="fecha_nacimiento" class="form-label">Fecha de Nacimiento</label>
                        <input id="fecha_nacimiento" class="form-control" v-model="form.fecha_nacimiento" type="date"
                            :disabled="!habilitarModificacion" />
                    </div>
                    <div class="w-3">
                        <label for="sexo" class="form-label">Sexo</label>
                        <select id="sexo" class="form-select" v-model="form.sexo" :disabled="!habilitarModificacion">
                            <option disabled value="default">Seleccione</option>
                            <option value="F">Femenino</option>
                            <option value="M">Masculino</option>
                        </select>
                    </div>
                    <div class="w-3">
                        <label for="cant_parientes" class="form-label">Cant. Parientes (hijos)</label>
                        <input id="cant_parientes" class="form-control" v-model="form.cant_parientes" type="number"
                            :disabled="!habilitarModificacion" />
                    </div>
                </div>

                <div class="fila">
                    <div class="w-3">
                        <label for="cod_dpto" class="form-label">Departamento</label>
                        <select id="cod_dpto" class="form-select" v-model="form.cod_dpto"
                            :disabled="!habilitarModificacion">
                            <option disabled value="default">Seleccione</option>
                            <option v-for="d in departamentos" :key="d.cod_dpto" :value="d.cod_dpto">
                                {{ d.descripcion }}
                            </option>
                        </select>
                    </div>
                    <div class="w-3">
                        <label for="cod_localidad" class="form-label">Localidad</label>
                        <select id="cod_localidad" class="form-select" v-model="form.cod_localidad"
                            :disabled="!habilitarModificacion">
                            <option disabled value="default">Seleccione</option>
                            <option v-for="l in localidades" :key="l.cod_localidad" :value="l.cod_localidad">
                                {{ l.descripcion }}
                            </option>
                        </select>
                    </div>
                    <div class="w-3">
                        <label for="cod_barrio" class="form-label">Barrio</label>
                        <select id="cod_barrio" class="form-select" v-model="form.cod_barrio"
                            :disabled="!habilitarModificacion">
                            <option disabled value="default">Seleccione</option>
                            <option v-for="b in barrios" :key="b.cod_barrio" :value="b.cod_barrio">
                                {{ b.descripcion }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="fila">
                    <div class="w-5">
                        <label for="domicilio" class="form-label">Domicilio</label>
                        <input id="domicilio" class="form-control" v-model="form.domicilio" type="text"
                            :disabled="!habilitarModificacion" />
                    </div>
                    <div class="w-5">
                        <label for="estado" class="form-label">Estado</label>
                        <select id="estado" class="form-select" v-model="form.estado"
                            :disabled="!habilitarModificacion">
                            <option disabled value="default">Seleccione</option>
                            <option :value="null">Sin Tarjeta</option>
                            <option value="SOLICITADA">Solicitada</option>
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="ENTREGADA">Entregada</option>
                            <option value="BAJA">Baja</option>
                        </select>
                    </div>
                </div>
                <div class="fila">
                    <div class="w-5">
                        <label for="observaciones" class="form-label">Agregar Observación</label>
                        <input id="observaciones" class="form-control" v-model="form.observaciones" type="text"
                            :disabled="!habilitarModificacion" />
                    </div>
                    <div class="w-5">
                        <label for="importe_acreditado" class="form-label">Importe Acreditado</label>
                        <input id="importe_acreditado" class="form-control" v-model="form.importe_acreditado"
                            type="number" step="0.01" :disabled="!habilitarModificacion" />
                    </div>
                </div>
                <div class="fila">
                    <div class="w-100" v-if="form.historias.length > 0">
                        <label for="historial" class="form-label">Historial</label>
                        <div class="historial">
                            <span class="w-100 block" v-for="(historia, index) in form.historias" :key="index">
                                <strong>{{ historia.fecha }}</strong> {{ historia.observaciones }}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="fila mt-2">
                    <div class="w-5 ml-auto">
                        <label for="archivo" class="btn-archivo">
                            <img class="pdf-logo" src="/recursos/logo-pdf.png" alt="">
                            Adjuntar archivo</label>
                        <input class="form-control" type="file" name="archivo" id="archivo"
                            accept=".pdf, .xls, .doc, .docx" hidden @change="manejarDocumento"
                            :disabled="!habilitarModificacion">
                    </div>
                </div>
                <!-- Previsualización de archivos -->
                <div v-if="archivo != null" class="vista-previa">
                    <div class="archivo-preview">
                        <a class="archivo">
                            <button type="button" class="btn-quitar" @click="quitarArchivoMsg"
                                :disabled="!habilitarModificacion">×</button>
                            <a class="to-hidden"
                                :href="`http://192.168.1.182:3000/uploads/beneficiario/${form.dni}/${archivo.nombre}`"
                                target="_blank">
                                <img :src="archivo.vistaPrevia" :alt="archivo.nombre" class="imagen-preview"
                                    v-if="archivo.tipo === 'imagen'" />
                                <img :src="archivo.vistaPrevia" alt="Documento" class="documento-preview"
                                    v-if="archivo.tipo === 'documento'" />
                                <div class="desc-archivo" :title="archivo.nombre">{{ archivo.nombre }}</div>
                            </a>
                        </a>
                    </div>
                </div>

                <span v-for="(n, index) in parientesArray" :key="index">
                    <hr>
                    <h4>Pariente {{ index + 1 }}</h4>
                    <div class="fila">
                        <div class="w-5">
                            <label :for="'pariente' + index + 1 + 'dni'">DNI</label>
                            <input :id="'pariente' + index + 1 + 'dni'" type="number" class="form-control"
                                v-model="parientesArray[index].dni">
                        </div>
                        <div class="w-5">
                            <label :for="'pariente' + index + 1 + 'nom'">Nombre Completo</label>
                            <input :id="'pariente' + index + 1 + 'nom'" type="text" class="form-control"
                                v-model="parientesArray[index].nombre">
                        </div>
                    </div>
                    <div class="fila">
                        <div class="w-5">
                            <label :for="'pariente' + index + 1 + 'fecha_nacimiento'" class="form-label">Fecha de
                                Nacimiento</label>
                            <input :id="'pariente' + index + 1 + 'fecha_nacimiento'" class="form-control"
                                v-model="parientesArray[index].fecha_nacimiento" type="date" />
                        </div>
                        <div class="w-5">
                            <label :for="'pariente' + index + 1 + 'tipo'" class="form-label">Tipo</label>
                            <select :id="'pariente' + index + 1 + 'tipo'" class="form-select"
                                v-model="parientesArray[index].tipo">
                                <option disabled value="default">Seleccione</option>
                                <option value="hijo">Hijo</option>
                                <option value="conyugue">Cónyugue</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>
                        <div class="w-5">
                            <label :for="'pariente' + index + 1 + 'sexo'" class="form-label">Sexo</label>
                            <select :id="'pariente' + index + 1 + 'sexo'" class="form-select"
                                v-model="parientesArray[index].sexo">
                                <option disabled value="default">Seleccione</option>
                                <option value="F">Femenino</option>
                                <option value="M">Masculino</option>
                            </select>
                        </div>
                    </div>
                </span>

                <div class="fila m-4">
                    <button type="button" class="btn-mensaje btn-imprimir" :disabled="!habilitarImprimir"
                        @click="imprimirFichaPDF">Imprimir</button>
                    <button type="submit" class="btn-mensaje" :disabled="!habilitarModificacion">Guardar</button>
                </div>
            </form>
        </div>
    </div>
</template>


<script>
import TarjetaModal from './TarjetaModalComponent.vue';
import jsPDF from 'jspdf';
import axios from 'axios';
export default {
    components: {
        TarjetaModal
    },
    data() {
        return {
            cuilInicio: '',
            cuilFin: '',
            form: {
                dni: '',
                nombre: '',
                cuil: '',
                fecha_nacimiento: '',
                sexo: 'default',
                cod_dpto: 'default',
                cod_localidad: 'default',
                cod_barrio: 'default',
                domicilio: '',
                fecha_registro: '',
                hora_registro: '',
                estado: 'default',
                fecha_modificacion: '',
                hora_modificacion: '',
                observaciones: '',
                cant_parientes: '',
                importe_acreditado: '',
                historias: [],
            },
            quitarArchivoMsgPopup: false,
            botonModificacion: false,
            departamentos: [],
            localidades: [],
            barrios: [],
            parientesArray: [],
            archivo: null,
            habilitarModificacion: false,
            habilitarImprimir: false,
            tieneTarjeta: false,
            cargandoDatos: false,
            mensajePopup: false,
            mensaje: '',
            tarjetaForm: {
                dni: '',
                num_cuenta: '',
                num_tarjeta: '',
                fecha_registro: '',
                estado: '',
                importe_acreditado: ''
            },
            modalVisible: false,
        }
    },
    watch: {
        'form.cod_dpto'(nuevo) {
            this.cargarLocalidades(nuevo);
            this.form.cod_localidad = '';
            this.form.cod_barrio = '';
            this.barrios = [];
        },
        'form.cod_localidad'(nuevo) {
            this.cargarBarrios(nuevo);
            this.form.cod_barrio = '';
        },
        'form.cant_parientes'(newVal) {
            this.actualizarParientes(newVal);
        },
    },
    async mounted() {
        await this.cargarDepartamentos();
    },
    methods: {
        updateCuil() {
            const inicio = this.cuilInicio.padStart(2, '0').slice(0, 2)
            const fin = this.cuilFin.slice(0, 1)
            const dni = this.form.dni
            this.form.cuil = `${inicio}${dni}${fin}`
        },
        capitalize(text) {
            return text.charAt(0).toUpperCase() + text.slice(1);
        },
        async imprimirFichaPDF() {
            const doc = new jsPDF();
            const lineHeight = 8;
            let y = 20;

            const addText = (label, value) => {
                doc.setFont("Helvetica", "bold");
                doc.text(`${label}:`, 20, y);

                doc.setFont("Helvetica", "normal");
                doc.text(`${value || '-'}`, 80, y); // Alineás el valor un poco más a la derecha
                doc.setFontSize(11);
                y += lineHeight;
            }

            const centrar = (texto, yPos, size = 11) => {
                doc.setFontSize(size);
                doc.setFont('Helvetica', 'bold');
                const width = doc.getStringUnitWidth(texto) * size / doc.internal.scaleFactor;
                const center = (doc.internal.pageSize.getWidth() - width) / 2;
                doc.text(texto, center, yPos);
            };

            const obtenerBase64 = (url) =>
                fetch(url).then(res => res.blob()).then(blob => new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                }));

            // Cargar imágenes
            const logo1 = await obtenerBase64("/recursos/icono-mds-negro.png");
            const logo2 = await obtenerBase64("/recursos/icono-gobierno.png");

            // Dibujar encabezado
            doc.addImage(logo1, 'PNG', 30, 10, 60, 15); // o ajustá ancho/alto según la proporción
            doc.addImage(logo2, 'PNG', 150, 10, 15, 15);

            // Santiago del Estero + Fecha
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(11);
            doc.text("SANTIAGO DEL ESTERO", 160, 35, { align: 'center' });
            const fecha = this.capitalize(new Date().toLocaleDateString('es-ES', {
                weekday: 'long', year:
                    'numeric', month: 'long', day: 'numeric'
            }));
            doc.text(fecha, 160, 40, { align: 'center' });

            // Título centrado
            y = 50;
            centrar("BENEFICIARIO DE TARJETA SOCIAL", y);
            y += lineHeight * 2;

            // Beneficiario
            addText("DNI", this.form.dni);
            addText("CUIL", this.form.cuil);
            addText("Nombre", this.form.nombre);
            addText("Fecha de Nacimiento", this.form.fecha_nacimiento);
            addText("Sexo", this.form.sexo === 'F' ? "Femenino" : "Masculino");
            addText("Cantidad de Parientes", this.form.cant_parientes);
            addText("Domicilio", this.form.domicilio);
            addText("Departamento", this.obtenerDescripcion(this.departamentos, this.form.cod_dpto));
            addText("Localidad", this.obtenerDescripcion(this.localidades, this.form.cod_localidad));
            addText("Barrio", this.obtenerDescripcion(this.barrios, this.form.cod_barrio));
            addText("Estado", this.form.estado);
            addText("Historial", this.form.observaciones || '-');
            for (const historia of this.form.historias) {
                addText(historia.fecha, historia.observaciones);
            }


            y += lineHeight;

            // Parientes
            if (this.parientesArray.length > 0) {
                doc.setFont("Helvetica", "bold");
                doc.text("-- Parientes --", 20, y);
                y += lineHeight;

                doc.setFont("Helvetica", "normal");
                this.parientesArray.forEach((p, index) => {
                    doc.text(`${index + 1}. DNI: ${p.dni || '-'} | Nombre: ${p.nombre || '-'}`, 25, y);
                    y += lineHeight;
                    doc.text(`   Nacimiento: ${p.fecha_nacimiento || '-'} | Sexo: ${p.sexo === 'F' ? 'Femenino' : p.sexo === 'M' ? 'Masculino' : '-'}`, 25, y);
                    y += lineHeight;
                });

                y += lineHeight;
            }

            // Registro
            addText("Fecha de Registro", this.form.fecha_registro);
            addText("Hora de Registro", this.form.hora_registro);
            addText("Fecha de Modificación", this.form.fecha_modificacion);
            addText("Hora de Modificación", this.form.hora_modificacion);

            doc.save(`ficha_beneficiario_${this.form.dni}.pdf`);
        },

        obtenerDescripcion(lista, codigo) {
            const item = lista.find(i => i.cod_dpto === codigo || i.cod_localidad === codigo || i.cod_barrio === codigo);
            return item ? item.descripcion : '-';
        },

        quitarArchivoMsg() {
            this.quitarArchivoMsgPopup = true;
        },
        manejarDocumento(event) {
            const archivo = event.target.files[0];
            if (!archivo) return;

            this.archivo = {
                tipo: "documento",
                archivo: archivo,
                vistaPrevia: archivo.name.endsWith(".pdf")
                    ? "/recursos/logo-pdf.png"
                    : archivo.name.endsWith(".xls")
                        ? "/recursos/logo-xls.png"
                        : "/recursos/logo-docx.png",
                nombre: archivo.name,
            };
        },
        async verTarjeta() {
            this.cargandoDatos = true;
            if (!this.form.dni) return;

            try {
                const { data } = await axios.get('/tarjetas/getDatos', {
                    params: { dni: this.form.dni }
                });

                if (data && Object.keys(data).length > 0) {
                    this.tarjetaForm = { ...data };
                    this.modalVisible = true;
                } else {
                    this.mostrarMensaje("No se encontró una tarjeta asociada al DNI.");
                }
            } catch (error) {
                console.error(error);
                this.mostrarMensaje("Error al buscar la tarjeta.");
            } finally {
                this.cargandoDatos = false;
            }
        },
        async cargarDepartamentos() {
            try {
                const { data } = await axios.get('/beneficiarios/departamentos');
                this.departamentos = data;
            } catch (err) {
                console.error('Error cargando departamentos', err);
            }
        },
        async cargarLocalidades(cod_dpto) {
            if (!cod_dpto) return;
            try {
                const { data } = await axios.get('/beneficiarios/localidades', {
                    params: { cod_dpto }
                });
                this.localidades = data;
            } catch (err) {
                console.error('Error cargando localidades', err);
            }
        },
        async cargarBarrios(cod_localidad) {
            if (!cod_localidad) return;
            try {
                const { data } = await axios.get('/beneficiarios/barrios', {
                    params: { cod_localidad }
                });
                this.barrios = data;
            } catch (err) {
                console.error('Error cargando barrios', err);
            }
        },
        mostrarMensaje(mensaje) {
            this.mensajePopup = true;
            this.mensaje = mensaje;
        },
        actualizarParientes(n) {
            const cantidad = parseInt(n);
            const nuevos = [];
            for (let i = 0; i < cantidad; i++) {
                nuevos.push({
                    dni: '',
                    nombre: '',
                    fecha_nacimiento: '',
                    sexo: ''
                });
            }
            this.parientesArray = nuevos;
        },
        resetForm() {
        this.cuilInicio = '';
        this.cuilFin = '';
            this.form.nombre = '';
            this.form.cuil = '';
            this.form.fecha_nacimiento = '';
            this.form.sexo = 'default';
            this.form.cod_dpto = 'default';
            this.form.cod_localidad = 'default';
            this.form.cod_barrio = 'default';
            this.form.domicilio = '';
            this.form.fecha_registro = '';
            this.form.hora_registro = '';
            this.form.estado = 'default';
            this.form.fecha_modificacion = '';
            this.form.hora_modificacion = '';
            this.form.observaciones = '';
            this.form.cant_parientes = '';
            this.form.historias = [];
            this.form.importe_acreditado = '';
            this.parientesArray = [];
            this.archivo = null;
            this.tieneTarjeta = false;
            this.tarjetaForm = {
                dni: '',
                num_cuenta: '',
                num_tarjeta: '',
                fecha_registro: '',
                estado: '',
                importe_acreditado: ''
            };
        },
        async comprobarPadron() {
            this.cargandoDatos = true;
            this.resetForm();
            try {
                const { data } = await axios.get('/beneficiarios/getDatos', {
                    params: { dni: this.form.dni }
                });

                if (data && Object.keys(data).length > 0) {
                    // Cargar datos en form
                    for (const key in data) {
                        if (key in this.form) {
                            this.form[key] = data[key];
                            if (this.form.cuil != '') {
                                this.cuilInicio = this.form.cuil.slice(0, 2);
                                this.cuilFin = this.form.cuil.slice(10);
                            }
                        }
                    }
                    if (data.archivo) {
                        this.archivo = {
                            tipo: data.archivo.endsWith('.pdf') ? 'documento'
                                : data.archivo.endsWith('.xls') ? 'documento'
                                    : data.archivo.endsWith('.doc') || data.archivo.endsWith('.docx') ? 'documento'
                                        : 'imagen',
                            nombre: data.archivo,
                            vistaPrevia: data.archivo.endsWith('.pdf') ? '/recursos/logo-pdf.png'
                                : data.archivo.endsWith('.xls') ? '/recursos/logo-xls.png'
                                    : data.archivo.endsWith('.doc') || data.archivo.endsWith('.docx') ? '/recursos/logo-docx.png'
                                        : `/uploads/${data.archivo}`, // si es imagen
                            id: 'archivo-servidor' // un id para poder quitarlo si querés
                        };
                    } else {
                        this.archivo = null;
                    }
                    if (data.estado != null) {
                        this.tieneTarjeta = true;
                    } else {
                        this.tieneTarjeta = false;
                    }
                    // Precargar selects si hay datos
                    if (data.cod_dpto) {
                        this.form.cod_dpto = data.cod_dpto;
                        await this.cargarLocalidades(data.cod_dpto);
                    }

                    if (data.cod_localidad) {
                        this.form.cod_localidad = data.cod_localidad;
                        await this.cargarBarrios(data.cod_localidad);
                    }

                    if (data.cod_barrio) {
                        this.form.cod_barrio = data.cod_barrio;
                    }

                    this.mostrarMensaje('Datos cargados automáticamente.');
                } else {
                    this.mostrarMensaje('No se encontró el DNI en ninguna fuente.');
                }
            } catch (err) {
                console.error(err);
                this.mostrarMensaje("No se encontró el DNI en ninguna fuente.");
            } finally {
                this.botonModificacion = true;
                this.cargandoDatos = false;
                this.habilitarImprimir = true;
            }
        },

        async quitarArchivo() {
            this.quitarArchivoMsgPopup = false;
            this.cargandoDatos = true;
            try {
                await axios.delete('/beneficiarios/quitarArchivo', {
                    params: { dni: this.form.dni }
                });
                this.archivo = null;
                this.form.archivo = null;
            } catch (error) {
                console.error(error);
                this.mostrarMensaje('Error al eliminar el archivo.');
            } finally {
                this.cargandoDatos = false;
                this.mostrarMensaje('Archivo eliminado correctamente.');
            }
        },

        async cargarBeneficiario() {
            const ahora = new Date();
            const fechaHoy = ahora.toISOString().split('T')[0];
            const horaHoy = ahora.toTimeString().split(' ')[0].slice(0, 5);

            if (!this.form.fecha_registro) this.form.fecha_registro = fechaHoy;
            if (!this.form.hora_registro) this.form.hora_registro = horaHoy;

            this.form.fecha_modificacion = fechaHoy;
            this.form.hora_modificacion = horaHoy;

            // Crear FormData
            const formData = new FormData();
            formData.append('beneficiario', JSON.stringify(this.form));
            formData.append('parientes', JSON.stringify(this.parientesArray));
            formData.append('archivo', this.archivo != null ? this.archivo.archivo : null);

            try {
                const response = await axios.post('/beneficiarios/update', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.data.success) {
                    this.mostrarMensaje("Beneficiario guardado correctamente.");
                } else {
                    this.mostrarMensaje("Error al guardar beneficiario.");
                }
            } catch (error) {
                console.error("Error al conectar con el servidor:", error);
                this.mostrarMensaje("Error de conexión.");
            }
        },


    },
}
</script>

<style scoped>
.orange {
    background-color: orange;
}

.orange:hover {
    background-color: rgb(255, 153, 0);

}

.btn-archivo {
    display: flex;
    flex-direction: row;
    gap: 5px;
    font-weight: bold;
}

.btn-archivo:hover {
    cursor: pointer;
    text-decoration: underline;
}

.pdf-logo {
    width: 25px;
}

.ml-auto {
    margin-left: auto;
}

.btns-comprobar {
    display: flex;
    flex-direction: row;
    gap: 5px;
    width: calc(50% - 5px);
    margin-top: auto;
    justify-content: start;
}

.historial {
    max-height: 100px;
    overflow: auto;
    background-color: rgb(241, 241, 241);
    border-radius: 10px;
    padding: 5px;
}

.block {
    display: block;
}

.btns-comprobar>.btn-mensaje {
    margin: 0;
}

.to-hidden {
    display: flex;
    text-overflow: ellipsis;
    overflow: hidden;
    text-wrap: nowrap;
}

input,
select {
    cursor: pointer;
}







input,
select {
    padding: 6px;
    font-size: 0.9rem;
    flex: 1 1 200px;
}

.vista-previa {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    margin-top: 20px;
    padding-bottom: 20px;
}

.archivo-preview {
    display: flex;
    flex-direction: row;
}

.imagen-preview,
.documento-preview {
    width: 20px;
    height: 20px;
    object-fit: cover;
    border-radius: 5px;
}

.archivo {
    position: relative;
    /* Necesario para posicionar el botón en relación al contenedor */
    display: flex;
    flex-direction: row;
    padding: 10px 30px 10px 10px;
    gap: 10px;
    width: 250px;
    border: 1px solid #ccc;
    border-radius: 5px;
    /* Ajusta según tus necesidades */
    background-color: #f9f9f9;
}

.btn-quitar {
    position: absolute;
    top: 5px;
    right: 5px;
    background: red;
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 14px;
    line-height: 18px;
    text-align: center;
    cursor: pointer;
    padding: 0;
}

.btn-quitar:hover {
    background: darkred;
}

.desc-archivo {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
}
</style>
