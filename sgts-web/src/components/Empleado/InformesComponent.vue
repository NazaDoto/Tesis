<template>
  <div class="vista">
    <div class="container">
      <!-- Pantalla de carga -->
      <div v-if="cargandoDatos" class="pantalla-carga-vista text-center">
        <div class="logo-carga">
          <img class="logo-img" src="/favicon.ico" width="50" alt="" />
          <div class="texto-carga">Cargando...</div>
        </div>
      </div>

      <!-- Popup mensajes -->
      <div v-if="mensajePopup" class="mensaje-container-fondo">
        <div class="mensaje-container">
          <span class="mensaje">{{ mensaje }}</span>
          <button class="btn-mensaje" @click="mensajePopup = false; mensaje = ''">Ok</button>
        </div>
      </div>

      <h3 class="mt-2">Generar Informes</h3>

      <!-- Filtros -->
      <section class="filtros">
        <div class="fila flex-between">
          <span class="gap-2">
            <label class="form-label" for="fechaDesde">
              Fecha desde:
              <input id="fechaDesde" class="form-control" type="date" v-model="fechaDesde" />
            </label>
            <label class="form-label" for="fechaHasta">
              Fecha hasta:
              <input id="fechaHasta" class="form-control" type="date" v-model="fechaHasta" />
            </label>
          </span>
          <label class="form-label" for="filtroEstado">
            Estado tarjeta:
            <select id="filtroEstado" class="form-select" v-model="estadoTarjeta">
              <option value="">Todos</option>
              <option value="SOLICITADA">Solicitada</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="ENTREGADA">Entregada</option>
              <option value="BAJA">Baja</option>
            </select>
          </label>
        </div>
      </section>

      <!-- Beneficiarios -->
      <section class="seccion">
        <h4 class="subtitulo">Beneficiarios</h4>
        <div class="fila">
          <button class="btn-opcion" @click="generar('beneficiarios', 'todo')">Todo</button>
          <button class="btn-opcion" @click="generar('beneficiarios', 'capital')">Capital</button>
          <button class="btn-opcion" @click="generar('beneficiarios', 'banda')">Banda</button>
          <button class="btn-opcion" @click="generar('beneficiarios', 'interior')">Interior</button>
        </div>
      </section>

      <!-- Tarjetas -->
      <section class="seccion">
        <h4 class="subtitulo">Tarjetas Sociales</h4>
        <div class="fila">
          <button class="btn-opcion" @click="generar('tarjetas', 'todo')">Todo</button>
          <button class="btn-opcion" @click="generar('tarjetas', 'capital')">Capital</button>
          <button class="btn-opcion" @click="generar('tarjetas', 'banda')">Banda</button>
          <button class="btn-opcion" @click="generar('tarjetas', 'interior')">Interior</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import * as XLSX from "xlsx";

export default {
  data() {
    return {
      cargandoDatos: false,
      mensajePopup: false,
      mensaje: "",
      fechaDesde: "",
      fechaHasta: "",
      estadoTarjeta: "",
    };
  },
  methods: {
    async generar(seccion, tipo) {
      try {
        this.cargandoDatos = true;

        let url = "";
        if (seccion === "beneficiarios") {
          url = `/informes/beneficiarios/${tipo}`;
        } else if (seccion === "tarjetas") {
          url = `/informes/tarjetas/${tipo}`;
        }

        // Agregar filtros como query params
        const params = {};
        if (this.fechaDesde) params.fecha_desde = this.fechaDesde;
        if (this.fechaHasta) params.fecha_hasta = this.fechaHasta;
        if (this.estadoTarjeta && seccion === "tarjetas") {
          params.estado = this.estadoTarjeta;
        }

        const res = await axios.get(url, { params });
        const datos = res.data;

        if (!datos || datos.length === 0) {
          this.mensaje = "No hay datos para este informe.";
          this.mensajePopup = true;
          return;
        }

        // Descargar XLS
        this.descargarXLS(seccion, tipo, datos);

      } catch (e) {
        console.error(e);
        this.mensaje = "Error al generar el informe.";
        this.mensajePopup = true;
      } finally {
        this.cargandoDatos = false;
      }
    },

    descargarXLS(seccion, tipo, datos) {
      const worksheet = XLSX.utils.json_to_sheet(datos);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Informe");
      XLSX.writeFile(workbook, `Informe_${seccion}_${tipo}.xlsx`);
    },
  },
};
</script>


<style scoped>
.flex-between {
  justify-content: space-between !important;
}

.gap-2 {
  display: flex;
  flex-direction: row;
}

.card {
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.titulo {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 25px;
  color: #3e3eab;
}

.subtitulo {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #333;
  font-weight: bold;
}

.seccion {
  margin-bottom: 25px;
}

.fila {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.btn-opcion {
  background-color: rgb(0, 179, 250);
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  flex: 1 1 150px;
  transition: background-color 0.3s ease;
  font-weight: 600;
}

.btn-opcion:hover {
  background-color: rgb(0, 158, 250);
}
</style>
