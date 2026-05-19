<template>
  <Teleport to="body">
    <div
      v-if="show"
      :class="variant === 'dark' ? 'pantalla-carga-vista' : 'pantalla-carga'"
      class="text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="logo-carga">
        <img class="logo-img" src="/favicon.ico" width="50" alt="" />
        <span class="texto-carga">{{ text }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'LoadingOverlay',
  props: {
    show: { type: Boolean, default: false },
    text: { type: String, default: 'Cargando...' },
    variant: {
      type: String,
      default: 'light',
      validator: (v) => ['light', 'dark'].includes(v),
    },
  },
};
</script>
