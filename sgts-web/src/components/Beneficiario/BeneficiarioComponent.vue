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
import emitter from '@/eventBus';
import { conectarRealtime, desconectarRealtime } from '@/services/realtimeSocket';
import { notificarSolicitudActualizada } from '@/utils/notificaciones';

export default {
  components: {
    SidebarBeneficiarioComponent,
  },
  data() {
    return {
      cargando: false,
      tieneTarjeta: null,
    };
  },
  methods: {
    obtenerDni() {
      try {
        return JSON.parse(localStorage.getItem('user') || '{}').dni;
      } catch {
        return null;
      }
    },
    async verificarTarjeta(silencioso = false) {
      const dni = this.obtenerDni();
      if (!dni) return;
      if (!silencioso) this.cargando = true;
      try {
        const response = await axios.get('/beneficiarios/verificarTarjeta', {
          params: { dni },
        });
        this.tieneTarjeta = response.data.estado;
        localStorage.setItem('tieneTarjeta', this.tieneTarjeta);
      } catch (error) {
        console.log('No tiene tarjeta.', error);
      } finally {
        if (!silencioso) this.cargando = false;
      }
    },
    onSolicitudActualizada(data) {
      const miDni = String(this.obtenerDni() || '');
      if (!miDni || String(data?.dni) !== miDni) return;
      notificarSolicitudActualizada(data);
      this.verificarTarjeta(true);
      emitter.emit('beneficiario_datos_actualizados', data);
    },
    onUsuarioDeslogueado() {
      desconectarRealtime();
    },
  },
  mounted() {
    conectarRealtime();
    this.verificarTarjeta();
    emitter.on('solicitud_actualizada', this.onSolicitudActualizada);
    emitter.on('usuarioDeslogueado', this.onUsuarioDeslogueado);
  },
  beforeUnmount() {
    emitter.off('solicitud_actualizada', this.onSolicitudActualizada);
    emitter.off('usuarioDeslogueado', this.onUsuarioDeslogueado);
    desconectarRealtime();
  },
};
</script>

<style scoped>
.flex-inline {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  background-color: #3e3eab;
}
@media screen and (max-width: 992px) {
  .vista {
    width:calc(100%);
    margin-right: auto;
  }
  }
</style>