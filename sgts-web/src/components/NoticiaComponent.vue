<template>
    <div class="vista-noticia">
        <!-- Navbar público -->
        <NavbarPublicoComponent />

        <!-- Pantalla de carga -->
        <div v-if="cargando" class="pantalla-carga text-center">
            <div class="logo-carga">
                <img class="logo-img" src="/favicon.ico" width="50" alt="Logo" />
                <div class="texto-carga">Cargando noticia...</div>
            </div>
        </div>

        <!-- Popup mensaje -->
        <div v-if="mensajePopup" class="mensaje-container-fondo">
            <div class="mensaje-container">
                <span class="mensaje">{{ mensaje }}</span>
                <button class="btn-mensaje" @click="mensajePopup = false; mensaje = ''">
                    Ok
                </button>
            </div>
        </div>

        <!-- Contenido de la noticia -->
        <div v-if="!cargando" class="contenido-noticia container">
            <main class="noticia-principal">
                <h2 class="titulo-noticia">{{ noticia.titulo }}</h2>
                <img v-if="noticia.imagen" :src="'https://nazadoto.com:3500' + noticia.imagen" alt=""
                    class="imagen-noticia" />
                <p class="contenido-texto">{{ noticia.contenido }}</p>
                <p class="fecha-texto">{{ formatearFecha(noticia.fecha) }}</p>
            </main>

            <!-- Aside con resto de las noticias -->
            <aside class="noticias-laterales">
                <h3>Otras noticias</h3>
                <div class="lista-noticias">
                    <router-link v-for="n in otrasNoticias" :key="n.id" :to="'/noticia/' + n.id"
                        class="noticia-lateral">
                        <img v-if="n.imagen" :src="'https://nazadoto.com:3500' + n.imagen" alt=""
                            class="noticia-imagen-lateral" />
                        <span>{{ n.titulo }}</span>
                    </router-link>
                </div>
            </aside>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import NavbarPublicoComponent from './NavbarPublicoComponent.vue';

export default {
    components: {
        NavbarPublicoComponent,
    },
    data() {
        return {
            noticia: {},
            otrasNoticias: [],
            cargando: false,
            mensajePopup: false,
            mensaje: "",
            id: this.$route.params.id,
        };
    },
    methods: {
        formatearFecha(fecha) {
            return new Date(fecha).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
            });
        },
        async fetchNoticia() {
            this.noticia = {};
            this.otrasNoticias = [];
            this.cargando = true;
            try {
                const res = await axios.get(`/noticias/getNoticia/${this.id}`);
                this.noticia = res.data;

                const res2 = await axios.get(`/noticias/get`);
                this.otrasNoticias = res2.data[0].filter(n => n.id !== this.noticia.id);

            } catch (e) {
                this.mensaje = "Error al cargar la noticia.";
                this.mensajePopup = true;
            } finally {
                this.cargando = false;
            }
        },
    },
    watch: {
        '$route.params.id'(newId) {
            this.id = newId;
            this.fetchNoticia();
        }
    },
    mounted() {
        this.fetchNoticia();
    },
};
</script>

<style scoped>
.container {
    display: flex;
    gap: 20px;
    margin-top: 20px;
    flex-wrap: wrap;
}

.noticia-principal {
    flex: 2;
}

.titulo-noticia {
    font-size: 2rem;
    margin-bottom: 10px;
}

.imagen-noticia {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    margin-bottom: 10px;
}

.contenido-texto {
    font-size: 1.1rem;
    line-height: 1.6;
}

.fecha-texto {
    font-size: 0.9rem;
    color: gray;
    margin-top: 10px;
}

.noticias-laterales {
    flex: 1;
    border-left: 1px solid #ccc;
    padding-left: 10px;
}

.lista-noticias {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.noticia-lateral {
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    text-decoration: none;
    color: inherit;
}

.noticia-imagen-lateral {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 6px;
}

.noticia-lateral span {
    font-size: 0.95rem;
}
</style>
