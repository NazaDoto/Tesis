<template>
    <div>
        <!-- Modal cerrar sesión -->
        <div v-if="mostrarModal" class="mensaje-container-fondo">
            <div class="mensaje-container">
                <span class="mensaje">¿Cerrar sesión?</span>
                <div class="modal-botones">
                    <button class="btn-mensaje" @click="mostrarModal = false">No</button>
                    <button class="btn-mensaje" @click="cerrarSesion">Si</button>
                </div>
            </div>
        </div>

        <!-- Sidebar -->
        <div class="contenedor" :class="{ 'sidebar-abierto': sidebarAbierto }">
            <div class="contenedor-botones">
                <!-- Hamburguesa -->
                <button
                    class="hamburguesa mb-2"
                    @click="sidebarAbierto = !sidebarAbierto"
                    :class="{ abierto: sidebarAbierto }"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <a href="/empleado" class="sidebar-header">
                    <img src="/recursos/logomds.png" class="img-logo" alt="">
                    <span class="sidebar-titulo">
                        <h4 class="white text-center">Tarjetas<br>Sociales</h4>
                    </span>
                </a>
                <hr>

                <nav class="nav-links">
                    <router-link class="item-btn" to="/empleado"
                        :class="{ active: $route.path == '/empleado' }"
                        @click="cerrarSidebarMobile">
                        <svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 9.75L12 3l9 6.75V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.75Z"/>
                            <path d="M9 22V12h6v10"/>
                        </svg>
                        <span class="label">Inicio</span>
                    </router-link>

                    <router-link class="item-btn" to="/empleado/solicitudes"
                        :class="{ active: $route.path === '/empleado/solicitudes' }"
                        @click="cerrarSidebarMobile">
                        <svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="8" y="2" width="8" height="4" rx="1"/>
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                            <line x1="9" y1="12" x2="15" y2="12"/>
                            <line x1="9" y1="16" x2="13" y2="16"/>
                        </svg>
                        <span class="label">Solicitudes</span>
                    </router-link>

                    <router-link class="item-btn" to="/empleado/beneficiarios"
                        :class="{ active: $route.path === '/empleado/beneficiarios' }"
                        @click="cerrarSidebarMobile">
                        <svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="9" cy="7" r="3"/>
                            <path d="M3 20a6 6 0 0 1 12 0"/>
                            <circle cx="18" cy="8" r="2.5"/>
                            <path d="M21 20a4 4 0 0 0-6.5-3.1"/>
                        </svg>
                        <span class="label">Beneficiarios</span>
                    </router-link>

                    <router-link class="item-btn" to="/empleado/tarjetas"
                        :class="{ active: $route.path === '/empleado/tarjetas' }"
                        @click="cerrarSidebarMobile">
                        <svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2"/>
                            <line x1="2" y1="10" x2="22" y2="10"/>
                            <line x1="6" y1="15" x2="9" y2="15"/>
                        </svg>
                        <span class="label">Tarjetas</span>
                    </router-link>

                    <router-link class="item-btn" to="/empleado/informes"
                        :class="{ active: $route.path === '/empleado/informes' }"
                        @click="cerrarSidebarMobile">
                        <svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10"/>
                            <line x1="12" y1="20" x2="12" y2="4"/>
                            <line x1="6"  y1="20" x2="6"  y2="14"/>
                            <line x1="2"  y1="20" x2="22" y2="20"/>
                        </svg>
                        <span class="label">Informes</span>
                    </router-link>

                    <button class="item-btn btn-cerrar-sesion" @click="cerrarSesionModal">
                        <svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        <span class="label">Cerrar Sesión</span>
                    </button>
                </nav>
            </div>
        </div>
    </div>
</template>

<script>
import emitter from '@/eventBus';
import router from '@/router';
import { desconectarSocketEmpleado } from '@/services/empleadoSocket';

export default {
    data() {
        return {
            mostrarModal: false,
            sidebarAbierto: false,
        }
    },
    methods: {
        cerrarSesionModal() {
            this.mostrarModal = true;
        },
        cerrarSesion() {
            this.mostrarModal = false;
            desconectarSocketEmpleado();
            localStorage.clear();
            emitter.emit('usuarioDeslogueado');
            router.push('/');
        },
        cerrarSidebarMobile() {
            if (window.innerWidth < 992) {
                this.sidebarAbierto = false;
            }
        }
    }
}
</script>

<style scoped>
/* ── Desktop ── */
.sidebar-header {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;
    text-decoration: none;
}

.img-logo {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
}

.sidebar-titulo {
    overflow: hidden;
    white-space: nowrap;
}

.modal-botones {
    display: flex;
    flex-direction: row;
    gap: 10px;
}

.nav-links {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.icono {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
}

.item-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    border: none;
    width: 100%;
    color: #fff !important;
    border-radius: 30px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    background: none;
    padding: 10px 14px;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.2s;
    white-space: nowrap;
    overflow: hidden;
}

.item-btn .label {
    font-size: 0.9rem;
}

.item-btn:hover,
.item-btn.active {
    background-color: rgb(72, 72, 168);
}

.btn-cerrar-sesion {
    margin-top: auto;
}

.contenedor {
    height: calc(100svh - 80px);
    width: 20svw;
    min-width: 180px;
}

.contenedor-botones {
    width: calc(100% - 20px);
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    position: sticky;
    top: 0;
}

/* ── Hamburguesa: oculto en desktop ── */
.hamburguesa {
    display: none;
    background: none;
    border: none;
    border-radius: 100%;
    padding: 8px 10px;
    cursor: pointer;
    flex-direction: column;
    gap: 5px;
    align-self: flex-start;
    flex-shrink: 0;
}
.hamburguesa:hover{
        background-color: rgba(49, 49, 147, 0.95);

}
.hamburguesa span {
    display: block;
    width: 20px;
    height: 2px;
    background: #fff;
    border-radius: 2px;
    transition: transform 0.3s, opacity 0.3s;
}

.hamburguesa.abierto span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburguesa.abierto span:nth-child(2) { opacity: 0; }
.hamburguesa.abierto span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* ── Responsive < 992px ── */
@media (max-width: 991px) {

    .hamburguesa {
        display: flex;
    }

    /* Siempre en flujo normal, nunca fixed */
    .contenedor {
        position: relative;
        height: 100svh;
        width: 40px;
        min-width: 40px;
        overflow: hidden;
        /* transiciona tanto el ancho como el contenedor-botones interno */
        transition: width 0.3s ease;
        z-index: 1000;
    }

    /* Expandido: crece en el flujo, empuja el contenido */
    .contenedor.sidebar-abierto {
        width: 220px;
    }

    /* El interior siempre tiene el ancho expandido para que
       los labels no rompan el layout al aparecer */
    .contenedor-botones {
        width: 220px;
        align-items: flex-start;
    }

    /* ── Colapsado ── */
    .contenedor:not(.sidebar-abierto) .label,
    .contenedor:not(.sidebar-abierto) .sidebar-titulo {
        opacity: 0;
        transition: opacity 0.15s ease;
        pointer-events: none;
    }

    .contenedor:not(.sidebar-abierto) .item-btn {
        padding: 10px 0;
        width: 40px;
        border-radius: 6px;
    }

    .contenedor:not(.sidebar-abierto) .sidebar-header {
        justify-content: flex-start;
        width: 40px;
        pointer-events: none;
    }

    .icono {
        margin-left: 10px;
    }

    .img-logo {
        width: 30px;
        height: 30px;
        margin-left: 5px;
    }

    /* ── Expandido ── */
    .contenedor.sidebar-abierto .label,
    .contenedor.sidebar-abierto .sidebar-titulo {
        opacity: 1;
        transition: opacity 0.2s ease 0.15s; /* aparece después de que el ancho se abre */
    }

    .contenedor.sidebar-abierto .item-btn {
        justify-content: flex-start;
        width: 100%;
        border-radius: 30px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }

    .contenedor.sidebar-abierto .sidebar-header {
        justify-content: flex-start;
        width: auto;
        pointer-events: auto;
    }
}
</style>