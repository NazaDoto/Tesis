<template>
    <div>
        <div v-if="mostrarModal" class="mensaje-container-fondo">
            <div class="mensaje-container">
                <span class="mensaje">¿Cerrar sesión?</span>
                <div class="modal-botones">
                    <button class="btn-mensaje" @click="this.mostrarModal = false">No</button>
                    <button class="btn-mensaje" @click="cerrarSesion">Si</button>
                </div>
            </div>
        </div>
        <div class="contenedor">
            <div class="contenedor-botones">
                <a href="/empleado" class="sidebar-header">
                    <img src="/recursos/logomds.png" class="mv-auto img-logo" alt="">
                    <h4 class="white text-center">Tarjetas<br>Sociales</h4>
                </a>
                <hr>
                <div>
                    <router-link class="item-btn" to="/empleado"
                        :class="{ active: $route.path == '/empleado' }">Inicio</router-link>
                </div>
                <div>
                    <router-link class="item-btn" to="/empleado/solicitudes"
                        :class="{ active: $route.path === '/empleado/solicitudes' }">Solicitudes</router-link>
                </div>
                <div>
                    <router-link class="item-btn" to="/empleado/beneficiarios"
                        :class="{ active: $route.path === '/empleado/beneficiarios' }">Beneficiarios</router-link>
                </div>
                <div>
                    <router-link class="item-btn" to="/empleado/tarjetas"
                        :class="{ active: $route.path === '/empleado/tarjetas' }">Tarjetas</router-link>
                </div>
                <div>
                    <router-link class="item-btn" to="/empleado/informes"
                        :class="{ active: $route.path === '/empleado/informes' }">Informes</router-link>
                </div>
                <button class="item-btn mt-4" @click="cerrarSesionModal">Cerrar Sesión</button>
            </div>
        </div>
    </div>
</template>

<script>
import emitter from '@/eventBus';
import router from '@/router';
export default {
    data() {
        return {
            mostrarModal: false,
        }
    },
    methods: {
        cerrarSesionModal() {
            this.mostrarModal = true;
        },
        cerrarSesion() {
            this.mostrarModal = false;
            localStorage.clear();
            emitter.emit('usuarioDeslogueado'); // emitimos evento
            router.push('/');
        }
    }
}
</script>

<style scoped>
.sidebar-header{
    display:flex;
    flex-direction: row;
    justify-content: center;
    gap: 10px;
}
.img-logo {
    width: 50px;
    height: 50px;
}

.modal-botones {
    display: flex;
    flex-direction: row;
    gap: 10px
}

.titulo-sidebar {
    color: white;
    text-align: center;
}

.item-btn {
    display: block;
    border: none;
    width: 100%;
    color: #fff !important;
    border-radius: 30px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    background: none;
}

.contenedor {
    height: calc(100svh - 80px);
    width: 20svw;
}

.contenedor-botones {
    text-align: center;
    width: calc(100% - 20px);
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
}

.item-btn {
    padding: 6px 12px;
}

.item-btn:hover {
    background-color: rgb(72, 72, 168);
    color: white;
}
</style>