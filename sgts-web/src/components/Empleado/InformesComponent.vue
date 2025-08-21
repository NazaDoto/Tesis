<template>
  <div class="vista">
    <div class="container">
      <div v-if="cargandoDatos" class="pantalla-carga-vista text-center">
        <div class="logo-carga">
          <img class="logo-img" src="/favicon.ico" width="50" alt="" />
          <div class="texto-carga">Cargando...</div>
        </div>
      </div>

      <div v-if="mensajePopup" class="mensaje-container-fondo">
        <div class="mensaje-container">
          <span class="mensaje">{{ mensaje }}</span>
          <button class="btn-mensaje" @click="mensajePopup = false; mensaje = ''">Ok</button>
        </div>
      </div>

      <h3 class="mt-2">Generar Informes</h3>

      <section class="seccion">
        <h4 class="subtitulo">Beneficiarios</h4>
        <div class="fila">
          <button class="btn-opcion" @click="generar('beneficiarios', 'todo')">Todo</button>
          <button class="btn-opcion" @click="generar('beneficiarios', 'capital')">Capital</button>
          <button class="btn-opcion" @click="generar('beneficiarios', 'banda')">Banda</button>
          <button class="btn-opcion" @click="generar('beneficiarios', 'interior')">Interior</button>
        </div>
      </section>

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

        const res = await axios.get(url);
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
