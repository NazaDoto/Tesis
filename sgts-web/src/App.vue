<template>
    <div class="body">
        <NavbarPublicoComponent
            v-if="$route.path === '/' || $route.path === '/login' || $route.path === '/contacto' || $route.path === '/registrar' || /^\/noticias(\/.*)?$/.test($route.path)" />
        <router-view></router-view>
    </div>
</template>

<script>
import 'bootstrap';
import '@popperjs/core';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarPublicoComponent from './components/NavbarPublicoComponent.vue';
export default {
    name: 'App',
    components: {
        NavbarPublicoComponent
    }
}
</script>

<style>
.formulario-beneficiario {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.w-5 {
    width: calc(50% - 5px);
}

.w-3 {
    width: calc(33% - (20px / 3));
}
.fila {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 10px;
}
.total {
    height: 100%;
}

a {
    text-decoration: none;
}

.mensaje-container-fondo {
    position: absolute;
    top: 0;
    left: 0;
    height: 100svh;
    width: 100svw;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 10;
}

.mensaje-container {
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    gap: 10px;
    height: 100px;
    min-width: 100px;
    padding: 20px;
    border-radius: 10px;
    background-color: white;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}

.active {
    background-color: rgb(70, 70, 192) !important;
}

.btn-mensaje {
    width: fit-content;
    padding: 5px 15px;
    margin: auto;
    background-color: rgb(0, 179, 250);
    color: white;
    border: none;
    border-radius: 999px;
}

.form-label {
    font-weight: bold;
}

.btn-mensaje:hover {
    background-color: rgb(0, 158, 250);
}

.btn-tarjeta {
    padding: 5px 15px;
    background-color: rgb(0, 250, 117);
    color: white;
    border: none;
    border-radius: 999px;
}


.btn-tarjeta:hover {
    background-color: rgb(0, 216, 101);
}
.btn-imprimir {
    background-color: rgb(255, 98, 98);
}

.btn-imprimir:hover {
    background-color: rgb(226, 63, 63);
}

.btn-tarjeta:disabled,
.btn-mensaje:disabled {
    background-color: rgb(222, 222, 222);
}

.link-pie {
    text-decoration: none;
    color: white;
}

.link-pie:hover {
    color: #94c1fc;
}

.body {
    position: relative;
    min-height: 100svh;
    margin: 0;
}

.vista {
    width: calc(80svw - 20px);
    height: calc(100svh - 20px);
    background-color: white;
    border-radius: 5px;
    overflow-y: auto;
    margin: 10px 0;
}

.ancho-pag {
    width: 100%;
    padding: 0 12svw 0 12svw;
}

.btn-css-underline {
    color: black;
    text-decoration: none;
    position: relative;
    cursor: pointer;
}

.btn-css-underline::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 5px;
    background-color: rgb(101, 201, 255);
    transition: width .1s ease;
}

.btn-css-underline:hover::after {
    width: 100%;
    /* Mostrar el borde completo al hacer hover */
}

.btn-entrar {
    font-size: 1.2rem;
    text-decoration: none;
    color: white;
    font-weight: 600;
    width: 100%;
    height: 50px;
    background-color: rgb(0, 179, 250);
    border: none;
    border-radius: 999px;
}

.btn-entrar:hover {
    color: white;
    background-color: rgb(0, 158, 250);
}

.btn-css {
    text-decoration: none;
    color: white;
    border-left: solid rgb(101, 201, 255) 4px;
    margin: 20px;
    padding: 10px 20px 15px 20px;
    position: relative;
}

.btn-css::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 5px;
    background-color: rgb(101, 201, 255);
    transition: width .3s ease;
}

.btn-css:hover::after {
    width: 100%;
}

html {
    overflow-y: auto;
}

.pl-2 {
    padding-left: 10px;
}

.modalCategoriaContainer {
    position: absolute;
    z-index: 1233;
    margin: 0;
    padding: 0;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
}

.modalCategoria {
    padding: 15px;
    margin: auto;
    width: 30vw;
    background-color: white;
    border-radius: 10px;
}

.btn-limpiar {
    display: block;
    background: linear-gradient(rgb(255, 255, 255),
            rgb(214, 214, 214)) !important;
    border: none;
    border-radius: 2px;
}

.btn-limpiar:hover {
    background: linear-gradient(rgb(242, 242, 242),
            rgb(201, 201, 201)) !important;
    cursor: pointer;
}

.btn-menu {
    color: white;
    border: none;
    border-radius: 2px;
    background: linear-gradient(#94c1fc, #005acf) !important;
    min-width: 100px;
}

.btn-menu:hover {
    background: linear-gradient(rgb(148, 193, 252), rgb(0, 87, 168)) !important;
    color: white;
}

.btn-menu:focus {
    color: white !important;
}

.navbar-toggler {
    outline: 0 !important;
    border: none !important;
    color: transparent;
    margin-left: 10px;
    padding: 3px;
}

.navbar-toggler:focus {
    outline: 0 !important;
    background: lightgray !important;
}

.btn-menu-danger {
    color: white;
    border: none;
    border-radius: 2px;
    background: linear-gradient(#ffafaf, #cf0000) !important;
}

.btn-menu-danger:hover {
    background: linear-gradient(rgb(255, 175, 175), rgb(168, 0, 0)) !important;
}

.barra-busqueda {
    border: none;
    box-shadow: 0.2px 0.2px 2px !important;
    border-radius: 1px !important;
}

.texto-carga {
    font-style: italic;
    margin: 20px;
    color: white;
}

.logo-carga {
    margin-top: -10vh;
}

.logo-img {
    animation: l2 2s infinite;
}

.form-control {
    border-radius: 4px !important;
    padding-right: 2.5rem;
    /* Espacio suficiente para el botón */
}

.nav-logo {
    border-radius: 100%;
    width: 40px;
    height: 40px;
    margin-right: 10px;
}

.form-control:focus {
    box-shadow: none;
}

.pantalla-carga {
    z-index: 2;
    position: absolute;
    top: 0;
    left: 0;
    width: 100svw;
    height: 100svh;
    background-color: white;
    align-content: center;
}

.pantalla-carga:hover {
    cursor: wait;
}
.pantalla-carga-vista {
    z-index: 2;
    position: absolute;
    top: 10px;
    left: 20svw;
    width: calc(80svw - 20px);
    height: calc(100svh - 20px);
    background-color: rgba(0, 0, 0, 0.5);
    align-content: center;
    border-radius: 5px;
}

.pantalla-carga-vista:hover {
    cursor: wait;
}

@keyframes l2 {
    to {
        transform: rotate(1turn)
    }
}

@media screen and (max-width: 992px) {}
</style>
