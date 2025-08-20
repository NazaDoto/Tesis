<template>
  <div class="vista">
    <div class="container">
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
            <button class="btn-opcion" @click="generar('tarjetas', 'ncaja')">N° Caja</button>
          </div>
        </section>
      </div>
  </div>
</template>

<script>
export default {
  methods: {
    generar(seccion, tipo) {
      // Lógica para generar informe
      console.log(`Generar PDF: ${seccion} - ${tipo}`);
    }
  }
}
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
