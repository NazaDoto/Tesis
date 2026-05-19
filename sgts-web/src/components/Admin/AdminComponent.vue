<template>
  <div class="flex-inline">
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

@media screen and (max-width: 992px) {
  .vista {
    width:calc(100%);
    margin-right: auto;
  }
  }
</style>