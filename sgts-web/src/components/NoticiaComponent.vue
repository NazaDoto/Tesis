<template>
    <div class="pagina-noticia">

        <!-- Loader -->
        <LoadingOverlay :show="cargando" text="Cargando noticia..." />

        <!-- Popup -->
        <div v-if="mensajePopup" class="mensaje-container-fondo">
            <div class="mensaje-container">
                <span class="mensaje">{{ mensaje }}</span>
                <button class="btn-mensaje" @click="mensajePopup = false">
                    Ok
                </button>
            </div>
        </div>

        <!-- Contenido -->
        <div v-if="!cargando" class="contenido-noticia">

            <!-- PRINCIPAL -->
            <main class="noticia-principal">

                <h1 class="titulo-noticia">{{ noticia.titulo }}</h1>

                <p class="fecha-texto">
                    {{ formatearFecha(noticia.fecha) }}
                </p>

                <img v-if="noticia.imagen"
                    :src="'https://nazadoto.com:3500' + noticia.imagen"
                    class="imagen-noticia"
                />

                <div class="contenido-texto" v-html="noticia.contenido"></div>

            </main>

            <!-- ASIDE -->
            <aside class="noticias-laterales">

                <h3 class="titulo-aside">Otras noticias</h3>

                <div class="lista-noticias">

                    <router-link
                        v-for="n in otrasNoticias"
                        :key="n.id"
                        :to="'/noticia/' + n.id"
                        class="card-noticia"
                    >
                        <img v-if="n.imagen"
                            :src="'https://nazadoto.com:3500' + n.imagen"
                            class="card-img"
                        />

                        <div class="card-body">
                            <span class="card-titulo">{{ n.titulo }}</span>
                        </div>
                    </router-link>

                </div>

            </aside>

        </div>

        <pie-component></pie-component>
    </div>
</template>

<script>
import axios from "axios";
import PieComponent from './PieComponent.vue';

export default {
  components: { PieComponent },
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

/* Layout general */
.pagina-noticia {
    max-width: 1200px;
    margin: auto;
}

/* Grid principal */
.contenido-noticia {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 30px;
    margin-top: 20px;
}

/* PRINCIPAL */
.noticia-principal {
    background: #fff;
    padding: 20px;
    border-radius: 12px;
}

.titulo-noticia {
    font-size: 2.2rem;
    margin-bottom: 10px;
}

.fecha-texto {
    font-size: 0.9rem;
    color: gray;
    margin-bottom: 15px;
}

.imagen-noticia {
    width: 100%;
    max-height: 350px;
    object-fit: contain;
    border-radius: 10px;
    margin-bottom: 15px;
}

.contenido-texto {
    font-size: 1.1rem;
    line-height: 1.7;
    text-align: justify;
}

/* ASIDE */
.noticias-laterales {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.titulo-aside {
    font-size: 1.2rem;
    margin-bottom: 5px;
}

/* Cards */
.lista-noticias {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.card-noticia {
    display: flex;
    gap: 10px;
    text-decoration: none;
    color: inherit;
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
}

.card-noticia:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.card-img {
    width: 100px;
    height: 80px;
    object-fit: cover;
}

.card-body {
    display: flex;
    align-items: center;
    padding: 5px;
}

.card-titulo {
    font-size: 0.95rem;
}

/* 📱 MOBILE */
@media (max-width: 991px) {

    .contenido-noticia {
        grid-template-columns: 1fr;
    }

    .noticias-laterales {
        margin-top: 20px;
        padding:20px;
    }

    .card-noticia {
        flex-direction: row;
    }

}

/* 📱 EXTRA SMALL */
@media (max-width: 600px) {

    .titulo-noticia {
        font-size: 1.6rem;
    }

    .contenido-texto {
        font-size: 1rem;
    }

    .card-img {
        width: 80px;
        height: 70px;
    }

}

</style>