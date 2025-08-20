<template>
  <div>
    <div class="banner">
      <img class="img-banner" src="../../public/recursos/ministerio-banner.jpg" alt="">
    </div>
    <div class="ancho-pag">
      <section class="noticias" v-if="noticias.length > 0">
        <!-- Noticia destacada a la izquierda -->
        <div class="noticia-destacada">
          <router-link :to="'/noticias/' + noticias[0].id" v-if="noticias.length > 0">
            <img class="noticia-imagen-destacada" :src="'http://localhost:3000' + noticias[0].imagenes[0]" alt="">
            <div class="noticia-titulo destacada">{{ noticias[0].titulo }}</div>
          </router-link>
        </div>

        <!-- Contenedor con overflow para el resto de las noticias -->
         <div class="flex-column">
           <div class="noticias-scroll">
             <router-link :to="'/noticias/' + noticia.id" v-for="noticia in noticias.slice(1)" :key="noticia.id"
               class="noticia-cuadrada">
               <img class="noticia-imagen" :src="'http://localhost:3000' + noticia.imagenes[0]" alt="">
               <div class="noticia-titulo">{{ noticia.titulo }}</div>
             </router-link>
           </div>
           <router-link class="btn-css-underline text-top mt-2" to="/noticias">Ver Más</router-link>
         </div>
      </section>
    </div>
    <div class="ancho-pag bg-dark mt-4">
      <!-- Sección de botones y descripción -->
      <div class="ts-descripcion">
        <h3><strong>Sobre el programa...</strong></h3>
        El programa provincial de Tarjetas Sociales está diseñado para asistir a personas en situación de vulnerabilidad
        estructural, quienes no cuentan con ingresos por trabajo activo, jubilación, pensión ni reciben la Tarjeta
        Alimentar Nacional. Este programa proporciona fondos destinados exclusivamente a la compra de alimentos de
        primera necesidad.
        <div class="ct-botones">
          <div class="flex-botones">
            <router-link class="white btn-css" to="/requisitos">VER REQUISITOS</router-link>
          </div>
        </div>
      </div>
    </div>
    <PieComponent></PieComponent>
  </div>
</template>




<script>
import PieComponent from './PieComponent.vue';
import axios from 'axios';
export default {
  components: {
    PieComponent
  },
  data() {
    return {
      noticias: [],

    }
  },
  methods: {
    async fetchNoticias(){
      try {
          const response = await axios.get('/noticias');
          this.noticias = response.data;
      } catch (error) {
        console.log('No se pudo obtener las noticias. ', error);
      }
    },
  },
  mounted(){
    this.fetchNoticias();
  },
}
</script>
<style scoped>
.flex-column{
  display:flex;
  flex-direction: column;
  width:30%;
}
.text-top{
  margin: 0 auto auto auto;
  text-align: center;
}
.destacada {
  font-size: 1.7rem !important;
}

.noticias {
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  margin-top: 20px;
}

.noticia-destacada {
  width: 60%;
  height: 350px;
  position: relative;
  box-shadow: 0px 0px 10px -2px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.noticias-scroll {
  padding: 0 10px;
  max-height: 350px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.noticia-cuadrada {
  position: relative;
  width: 100%;
  height: 150px;
  box-shadow: 0px 0px 10px -2px rgba(0, 0, 0, 0.4);
}

.noticia-imagen-destacada {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.noticia-imagen {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.noticia-titulo {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 1px black;
  text-align: center;
  background-image: linear-gradient(transparent, rgba(62, 62, 171, 0.9));
}

.banner {
  position: relative;
  width: 100%;
}

.img-banner {
  width: 100%;
}





.ct-botones {
  color: white;
  text-align: center;
}

.flex-botones {
  width: 100%;
  display: flex;
  justify-content: space-around;
  font-weight: bold;
}

hr {
  margin: 2px 0;
  color: grey;
}

.ts-descripcion {
  text-align: center;
  padding: 20px 20px 0px 20px;
  color: white;
}

.flex-end {
  margin-left: auto;
}

@media only screen and (max-width: 1150px) {
  .ancho-pag{
    padding:0 5px;
  }
  .noticias{
    flex-direction: column;
    gap: 10px;
  }
  .noticia-destacada, .flex-column{
    width: 100%;
    padding: 0;
  }
  .noticia-destacada{
    height: 200px;
  }
  .noticias-scroll{
    flex-direction: row;
    justify-content: space-evenly;
    overflow-x:auto;
    padding: 0;
  }
  .noticia-cuadrada, .noticia-imagen{
    width: 150px;
  }
}

</style>