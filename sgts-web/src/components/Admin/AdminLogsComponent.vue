<template>
  <div class="vista">
    <div class="container">
      <h3 class="mt-2">Auditoría del Sistema</h3>

      <!-- FILTROS -->
      <section class="filtros">
        <h4 class="subtitulo">Filtros</h4>
        <div class="fila">
          <label>
            Fecha desde:
            <input type="date" v-model="fechaDesde" />
          </label>
          <label>
            Fecha hasta:
            <input type="date" v-model="fechaHasta" />
          </label>
          <label>
            Usuario:
            <input type="text" v-model="usuario" placeholder="Usuario" />
          </label>
          <label>
            Tipo de actividad:
            <select v-model="actividad">
              <option value="">Todas</option>
              <option value="LOGIN">Login</option>
              <option value="CREAR">Crear</option>
              <option value="ACTUALIZAR">Actualizar</option>
              <option value="ELIMINAR">Eliminar</option>
              <option value="EXPORTAR">Exportar</option>
            </select>
          </label>
          <button class="btn-opcion" @click="cargarLogs">Aplicar</button>
          <button class="btn-opcion" @click="exportarExcel">Exportar Excel</button>
        </div>
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
              <td>{{ log.fecha }}</td>
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
    async cargarLogs() {
      try {
        const params = {};
        if (this.fechaDesde) params.fecha_desde = this.fechaDesde;
        if (this.fechaHasta) params.fecha_hasta = this.fechaHasta;
        if (this.usuario) params.usuario = this.usuario;
        if (this.actividad) params.actividad = this.actividad;

        const res = await axios.get("/logs", { params });
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
