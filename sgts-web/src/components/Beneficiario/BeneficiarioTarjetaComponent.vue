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
                <button class="btn-mensaje" @click="this.mensajePopup = false; this.mensaje = ''">
                    Ok
                </button>
            </div>
        </div>

        <!-- Datos de tarjeta -->
        <div class="container" id="datosTarjeta">
            <h3 class="mt-2">Datos de Tarjeta Social</h3>

            <div class="tarjeta-grid">
                <div class="dato">
                    <span class="label">DNI</span>
                    <span class="valor">{{ tarjeta.dni }}</span>
                </div>
                <div class="dato">
                    <span class="label">Número de Cuenta</span>
                    <span class="valor">{{ tarjeta.num_cuenta || '####-####-####-####' }}</span>
                </div>
                <div class="dato">
                    <span class="label">Número de Tarjeta</span>
                    <span class="valor">{{ tarjeta.num_tarjeta || '####-####-####-####' }}</span>
                </div>
                <div class="dato">
                    <span class="label">Fecha de Registro</span>
                    <span class="valor">{{ tarjeta.fecha_registro }}</span>
                </div>
                <div class="dato">
                    <span class="label">Fecha de Modificación</span>
                    <span class="valor">{{ tarjeta.fecha_modificacion }}</span>
                </div>
                <div class="dato">
                    <span class="label">Estado</span>
                    <span class="valor estado" :class="'estado-' + tarjeta.estado.toLowerCase()">
                        {{ tarjeta.estado }}
                    </span>
                </div>
                <div class="dato">
                    <span class="label">Importe Acreditado</span>
                    <span class="valor">
                        {{ tarjeta.importe_acreditado ? '$' + tarjeta.importe_acreditado : '####' }}
                    </span>
                </div>
            </div>

            <!-- Historial -->
            <div v-if="tarjeta.historias.length > 0" class="historial-container">
                <h3 class="subtitulo">Historial</h3>
                <div class="historial">
                    <div v-for="(historia, index) in tarjeta.historias" :key="index" class="historia-item">
                        <strong>{{ historia.fecha + ' - ' }}</strong>
                        <span>{{ historia.observaciones }}</span>
                    </div>
                </div>
            </div>

            <!-- Botón -->
            <div class="acciones">
                <button type="button" class="btn-imprimir" @click="imprimir">Imprimir</button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import jsPDF from 'jspdf';
export default {
    data() {
        return {
            cargando: false,
            mensajePopup: false,
            mensaje: '',
            tarjeta: {
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
        }
    },
    methods: {
        async fetchTarjeta() {
            this.cargando = true;
            try {
                const response = await axios.get('tarjetas/getDatos', {
                    params: { dni: JSON.parse(localStorage.getItem('user')).dni }
                });
                this.tarjeta = response.data;
            } finally {
                this.cargando = false;
            }
        },
        async imprimir() {
            const doc = new jsPDF();
            const lineHeight = 8;
            let y = 20;

            const addText = (label, value) => {
                doc.setFont("Helvetica", "bold");
                doc.text(`${label}:`, 20, y);

                doc.setFont("Helvetica", "normal");
                doc.text(`${value || '-'}`, 80, y);
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
            doc.addImage(logo1, 'PNG', 30, 10, 60, 15);
            doc.addImage(logo2, 'PNG', 150, 10, 15, 15);

            // Santiago del Estero + Fecha
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(11);
            doc.text("SANTIAGO DEL ESTERO", 160, 35, { align: 'center' });
            const fecha = this.capitalize(new Date().toLocaleDateString('es-ES', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            }));
            doc.text(fecha, 160, 40, { align: 'center' });

            // Título centrado
            y = 50;
            centrar("DATOS DE TARJETA SOCIAL", y);
            y += lineHeight * 2;

            // Datos principales de la tarjeta
            addText("DNI", this.tarjeta.dni);
            addText("Número de Cuenta", this.tarjeta.num_cuenta || "####-####-####-####");
            addText("Número de Tarjeta", this.tarjeta.num_tarjeta || "####-####-####-####");
            addText("Fecha de Registro", this.tarjeta.fecha_registro);
            addText("Fecha de Modificación", this.tarjeta.fecha_modificacion);
            addText("Estado", this.tarjeta.estado);
            addText("Importe Acreditado", this.tarjeta.importe_acreditado ? "$" + this.tarjeta.importe_acreditado : "####");

            y += lineHeight;

            // Historial
            if (this.tarjeta.historias && this.tarjeta.historias.length > 0) {
                doc.setFont("Helvetica", "bold");
                doc.text("-- Historial --", 20, y);
                y += lineHeight;

                doc.setFont("Helvetica", "normal");
                this.tarjeta.historias.forEach((h) => {
                    doc.text(`${h.fecha}: ${h.observaciones}`, 25, y);
                    y += lineHeight;

                    // salto de página si se pasa
                    if (y > 270) {
                        doc.addPage();
                        y = 20;
                    }
                });

                y += lineHeight;
            }

            doc.save(`tarjeta_social_${this.tarjeta.dni}.pdf`);
        },
        capitalize(text) {
            return text.charAt(0).toUpperCase() + text.slice(1);
        },
    },
    mounted() {
        this.fetchTarjeta();
    }
}
</script>

<style scoped>
/* Contenedor general */
.tarjeta-container {
    background: #fff;
    border-radius: 12px;
    padding: 20px 30px;
    margin: 20px auto;
    max-width: 900px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}

/* Titulos */
.titulo {
    font-size: 1.5rem;
    font-weight: 600;
    color: #3e3eab;
    margin-bottom: 20px;
    text-align: center;
}

.subtitulo {
    font-size: 1.2rem;
    font-weight: 500;
    margin: 15px 0 10px;
    color: #444;
}

/* Grid de datos */
.tarjeta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px 25px;
}

.dato {
    display: flex;
    flex-direction: column;
    background: #f9f9f9;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #eee;
}

.label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #666;
    margin-bottom: 4px;
}

.valor {
    font-size: 1rem;
    font-weight: 500;
    color: #222;
}

/* Estado con colores */
.estado {
    padding: 3px 8px;
    border-radius: 6px;
    font-weight: 600;
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

/* Historial */
.historial-container {
    margin-top: 20px;
}

.historial {
    max-height: 250px;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 10px;
    background: #fafafa;
}

.historia-item {
    padding: 8px 0;
    border-bottom: 1px solid #ddd;
}

.historia-item:last-child {
    border-bottom: none;
}

/* Acciones */
.acciones {
    text-align: center;
    margin-top: 20px;
}

.btn-imprimir {
    background: #3e3eab;
    color: white;
    padding: 10px 18px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.3s;
}

.btn-imprimir:hover {
    background: #2c2c87;
}
</style>
