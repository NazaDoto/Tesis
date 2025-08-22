<template>
    <div class="vista">
        <div class="container">
            <h3 class="mt-2">Registro de actividades</h3>

            <!-- FILTROS -->
            <section class="filtros">
                <div class="g-2">

                        <label class="form-label" for="fechaDesde">
                            Fecha desde:
                            <input type="date" class="form-control" v-model="fechaDesde" id="fechaDesde" />
                        </label>
                        <label class="form-label" for="fechaHasta">
                            Fecha hasta:
                            <input type="date" class="form-control" v-model="fechaHasta" id="fechaHasta" />
                        </label>
                    <label class="form-label" for="filtroUsuario">
                        Usuario:
                        <input type="text" class="form-control" v-model="usuario" placeholder="Usuario"
                            id="filtroUsuario" />
                    </label>
                    <label class="form-label" for="actividad">
                        Tipo de actividad:
                        <select class="form-select" v-model="actividad" id="actividad">
                            <option value="">Todas</option>
                            <option value="LOGIN">Login</option>
                            <option value="CREAR">Crear</option>
                            <option value="ACTUALIZAR">Actualizar</option>
                            <option value="ELIMINAR">Eliminar</option>
                            <option value="EXPORTAR">Exportar</option>
                        </select>
                    </label>
                    <button class="btn-opcion" @click="cargarLogs">Aplicar</button>
                </div>
                <button class="btn-opcion" @click="exportarExcel">Exportar Excel</button>
            </section>

            <!-- TABLA DE LOGS -->
            <div class="tabla-container">
                <table class="tabla">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Actividad</th>
                            <th>Detalles</th>
                            <th>IP</th>
                            <th>User Agent</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="log in logs" :key="log.id">
                            <td>{{ log.id }}</td>
                            <td>{{ log.usuario }}</td>
                            <td>{{ log.actividad }}</td>
                            <td>{{ log.detalles }}</td>
                            <td>{{ log.ip }}</td>
                            <td>{{ log.user_agent }}</td>
                            <td>{{ formatearFecha(log.fecha) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import * as XLSX from "xlsx";

export default {
    data() {
        return {
            logs: [],
            fechaDesde: "",
            fechaHasta: "",
            usuario: "",
            actividad: "",
        };
    },
    methods: {
        formatearFecha(fecha) {
            const d = new Date(fecha);

            const dia = String(d.getDate()).padStart(2, "0");
            const mes = String(d.getMonth() + 1).padStart(2, "0");
            const anio = String(d.getFullYear()).slice(-2);

            const horas = String(d.getHours()).padStart(2, "0");
            const minutos = String(d.getMinutes()).padStart(2, "0");

            return `${dia}/${mes}/${anio} - ${horas}:${minutos}`;
        },

        async cargarLogs() {
            try {
                const params = {};
                if (this.fechaDesde) params.fecha_desde = this.fechaDesde;
                if (this.fechaHasta) params.fecha_hasta = this.fechaHasta;
                if (this.usuario) params.usuario = this.usuario;
                if (this.actividad) params.actividad = this.actividad;

                const res = await axios.get("/get/logs", { params });
                this.logs = res.data;
            } catch (e) {
                console.error("Error al cargar logs:", e);
            }
        },
        exportarExcel() {
            if (!this.logs.length) return;

            const worksheet = XLSX.utils.json_to_sheet(this.logs);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
            XLSX.writeFile(workbook, `Logs.xlsx`);
        },
    },
    mounted() {
        this.cargarLogs();
    },
};
</script>

<style scoped>
.subtitulo {
    font-size: 1.2rem;
    margin-bottom: 10px;
    color: #333;
    font-weight: bold;
}
.g-2{
    display:flex;
    flex-direction: row;
    gap: 10px;
}
.fila {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 20px;
}

.btn-opcion {
    background-color: rgb(0, 179, 250);
    color: white;
    padding: 8px 15px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-weight: 600;
    height: fit-content;
    margin-top:auto;
    margin-bottom: 8px;
}

.btn-opcion:hover {
    background-color: rgb(0, 158, 250);
}

.tabla-container {
    overflow-x: auto;
    margin-top: 20px;
}

.tabla {
    width: 100%;
    border-collapse: collapse;
}

.tabla th,
.tabla td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
}

.tabla th {
    background-color: #f5f5f5;
}
</style>
