<template>
    <div>
        <nav class="barra-navegacion">
            <div class="ancho-pag fondo-nav c-white">
                <a href="/" class="flex">
                    <img src="/recursos/logomds.png" class="mv-auto img-logo" alt="">
                    <h1 class="mb-0 p-3 titulo-navbar">Tarjetas Sociales</h1>
                </a>
                <router-link v-if="!logueado" class="btn-ingresar" to="/login">Iniciar sesión</router-link>
                <button v-else-if="$route.path == '/'" class="btn btn-ingresar" @click="redireccionarInicio">Inicio</button>
            </div>
        </nav>
    </div>
</template>

<script>
import router from '@/router';
import emitter from '@/eventBus';

export default {
    data() {
        return {
            usuario: null,
            logueado: false
        }
    },
    mounted() {
        this.obtenerUsuario();
        emitter.on('usuarioLogueado', this.obtenerUsuario);
        emitter.on('usuarioDeslogueado', this.obtenerUsuario);
        console.log('Se carga navbarpublico');
    },
    unmounted() {
        emitter.off('usuarioLogueado', this.obtenerUsuario);
        emitter.off('usuarioDeslogueado', this.obtenerUsuario);
    },
    methods: {
        obtenerUsuario() {
            this.usuario = JSON.parse(localStorage.getItem('user'));
            this.logueado = this.usuario != null;
        },
        redireccionarInicio(){
            console.log(this.usuario)
        switch (this.usuario.rol) {
          case 0:
            router.push('/beneficiario');
            break;
          case 1:
            router.push('/empleado');
            break;
          case 2:
            router.push('/admin');
            break;
        }
        },
    }
}
</script>

<style scoped>
a + .btn-ingresar{
    cursor:pointer;
    margin-left: auto;
}
.img-logo {
    width: 50px;
    height: 50px;
}

.mv-auto {
    margin: auto 0;
}

.ancho-pag {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
.notAncho-pag{
        display: flex;
        flex-direction: row;
        padding: 0 20px;
}
.c-white {
    color: white;
}


.btn-ingresar {
    font-size: 1.2rem;
    text-decoration: none;
    color: white;
    font-weight: 600;
    background-color: rgb(0, 179, 250);
    border-radius: 999px;
    height: 50%;
    margin: auto 0;
    padding: 5px 20px;
}

.btn-ingresar:hover {
    background-color: rgb(0, 158, 250);
}

.fondo-nav {
    background-color: rgb(62, 62, 171);

}

.flex {
    display: flex;
}

.barra-navegacion {}

.navbar {
    padding: 0 20px;
    height: 40px;
}

a {
    text-decoration: none;
    color: inherit;
}

@media screen and (max-width: 750px) {
    .titulo-navbar {
        display: none;
    }

    .btn-ingresar {
        font-size: 1rem;
    }

    .img-logo {
        padding: 5px;
    }
}
</style>
