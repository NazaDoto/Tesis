<template>
  <div class="flex-inline">
    <div v-if="cargando" class="pantalla-carga text-center">
      <div class="logo-carga">
        <img class="logo-img" src="/favicon.ico" width="50" alt="Logo" />
        <div class="texto-carga c-black">Cargando...</div>
      </div>
    </div>
    <SidebarAdminComponent></SidebarAdminComponent>
    <router-view class="vista"></router-view>

  </div>
</template>

<script>
import SidebarAdminComponent from './SidebarAdminComponent.vue';
export default {
  components: {
    SidebarAdminComponent,
  },
  data() {
    return {
      cargando: false,
    }
  },
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