<template>
  <div class="container">
    <nav class="navbar">
      <ul class="navbar-nav">
        <li class="nav-item" :class="{'active': $route.path == '/home'}">
          Inicio
        </li>
        <li class="nav-item" :class="{'active': $route.path == '/solicitar-tarjeta'}">
          Solicitar
        </li>
        <li class="nav-item" :class="{'active': $route.path == '/mi-tarjeta'}">
          Mi Tarjeta
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>

export default {

}
</script>

<style scoped>
.navbar{
  width:100%;
}
.navbar-nav{
  display:flex;
  flex-direction: row;
  gap:10px;
}
.active{
  font-weight: bold;
}
</style>