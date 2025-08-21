<template>
  <div class="vista">
    <div v-if="cargando" class="pantalla-carga text-center">
      <div class="logo-carga">
        <img class="logo-img" src="/favicon.ico" width="50" alt="Logo" />
        <div class="texto-carga">Cargando...</div>
      </div>
    </div>

    <div v-if="!cargando && noticia">
      <div class="noticia-principal">
        <img v-if="noticia.imagen" :src="'https://nazadoto.com:3500' + noticia.imagen" class="noticia-imagen-principal" alt="Imagen noticia">
        <h1 class="noticia-titulo-principal">{{ noticia.titulo }}</h1>
        <p class="noticia-contenido">{{ noticia.contenido }}</p>
      </div>

      <aside class="noticias-otras">
        <h4>Otras noticias</h4>
        <div v-for="n in otrasNoticias" :key="n.id" class="noticia-otra">
          <router-link :to="'/noticia/' + n.id">
            <img v-if="n.imagen" :src="'https://nazadoto.com:3500' + n.imagen" class="noticia-imagen-pequena" alt="Imagen noticia">
            <div class="noticia-titulo-pequena">{{ n.titulo }}</div>
          </router-link>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: ['id'],
  data() {
    return {
      cargando: false,
      noticia: null,
      otrasNoticias: [],
    };
  },
  methods: {
    async fetchNoticia() {
      this.cargando = true;
      try {
        // Cargar noticia principal
        const res = await axios.get(`/get/noticia/${this.id}`);
        this.noticia = res.data;

        // Cargar resto de noticias
        const res2 = await axios.get('/get/noticias');
        // Filtrar la noticia actual
        this.otrasNoticias = res2.data.filter(n => n.id !== this.id);
      } catch (e) {
        console.error('Error al cargar noticias:', e);
      } finally {
        this.cargando = false;
      }
    }
  },
  mounted() {
    this.fetchNoticia();
  }
};
</script>

<style scoped>
.noticia-principal {
  width: 70%;
  float: left;
  padding-right: 20px;
}

.noticia-imagen-principal {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.noticia-titulo-principal {
  font-size: 28px;
  font-weight: 700;
  margin: 15px 0;
}

.noticia-contenido {
  font-size: 16px;
  line-height: 1.6;
}

.noticias-otras {
  width: 28%;
  float: right;
  padding-left: 10px;
}

.noticia-otra {
  margin-bottom: 15px;
}

.noticia-imagen-pequena {
  width: 100%;
  max-height: 80px;
  object-fit: cover;
  border-radius: 6px;
}

.noticia-titulo-pequena {
  font-size: 14px;
  font-weight: 600;
  margin-top: 5px;
}

.vista::after {
  content: "";
  display: table;
  clear: both;
}
</style>
