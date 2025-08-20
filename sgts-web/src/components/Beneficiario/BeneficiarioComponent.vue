<template>
  <div class="flex-inline">
    <div v-if="cargando" class="pantalla-carga text-center">
      <div class="logo-carga">
        <img class="logo-img" src="/favicon.ico" width="50" alt="Logo" />
        <div class="texto-carga c-black">Cargando...</div>
      </div>
    </div>
    <SidebarBeneficiarioComponent :tiene-tarjeta="tieneTarjeta"></SidebarBeneficiarioComponent>
    <router-view class="vista" :tiene-tarjeta="tieneTarjeta"></router-view>

  </div>
</template>

<script>
import SidebarBeneficiarioComponent from './SidebarBeneficiarioComponent.vue';
import axios from 'axios';
export default {
  components: {
    SidebarBeneficiarioComponent,
  },
  data() {
    return {
      cargando: false,
      tieneTarjeta: null
    }
  },
  methods: {
    async verificarTarjeta() {
      this.cargando = true;
      const dni = JSON.parse(localStorage.getItem('user')).dni
      try {
        const response = await axios.get('/beneficiarios/verificarTarjeta', {
          params: { dni: dni }
        });
        this.tieneTarjeta = response.data.estado;
        localStorage.setItem('tieneTarjeta', this.tieneTarjeta);
      } catch (error) {
        console.log('No tiene tarjeta.');
      } finally {
        this.cargando = false;
      }
    },
  },
  mounted() {
    this.verificarTarjeta();
  }
}
</script>

<style scoped>
.flex-inline {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  background-color: #3e3eab;
}
</style>