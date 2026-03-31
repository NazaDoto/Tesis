<template>
    <div>
        <div v-if="mostrarModal" class="mensaje-container-fondo">
            <div class="mensaje-container">
                <span class="mensaje">¿Cerrar sesión?</span>
                <div class="modal-botones">
                    <button class="btn-mensaje" @click="mostrarModal = false">No</button>
                    <button class="btn-mensaje" @click="cerrarSesion">Si</button>
                </div>
            </div>
        </div>

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

                <a href="/admin" class="sidebar-header">
                    <img src="/recursos/logomds.png" class="img-logo" alt="">
                    <span class="sidebar-titulo">
                        <h4 class="white text-center">Tarjetas<br>Sociales</h4>
                    </span>
                </a>
                <hr>

                <nav class="nav-links">
                    <router-link class="item-btn" to="/admin"
                        :class="{ active: $route.path == '/admin' }">
                        <!-- Inicio: home -->
                        <svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 9.75L12 3l9 6.75V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.75Z"/>
                            <path d="M9 22V12h6v10"/>
                        </svg>
                        <span class="label">Inicio</span>
                    </router-link>

                    <router-link class="item-btn" to="/admin/usuarios"
                        :class="{ active: $route.path === '/admin/usuarios' }">
                        <!-- Usuarios: person -->
                        <svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="7" r="4"/>
                            <path d="M4 20a8 8 0 0 1 16 0"/>
                        </svg>
                        <span class="label">Usuarios</span>
                    </router-link>

                    <router-link class="item-btn" to="/admin/noticias"
                        :class="{ active: $route.path === '/admin/noticias' }">
                        <!-- Noticias: newspaper -->
                        <svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <line x1="7" y1="8" x2="17" y2="8"/>
                            <line x1="7" y1="12" x2="17" y2="12"/>
                            <line x1="7" y1="16" x2="12" y2="16"/>
                        </svg>
                        <span class="label">Noticias</span>
                    </router-link>

                    <router-link class="item-btn" to="/admin/logs"
                        :class="{ active: $route.path === '/admin/logs' }">
                        <!-- Logs: terminal -->
                        <svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="3" width="20" height="18" rx="2"/>
                            <path d="M7 8l3 3-3 3"/>
                            <line x1="13" y1="14" x2="17" y2="14"/>
                        </svg>
                        <span class="label">Logs</span>
                    </router-link>

                    <button class="item-btn btn-cerrar-sesion" @click="cerrarSesionModal">
                        <!-- Cerrar sesión: log out -->
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

.hamburguesa:hover {
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

    .contenedor {
        position: relative;
        height: 100svh;
        width: 40px;
        min-width: 40px;
        overflow: hidden;
        transition: width 0.3s ease;
        z-index: 1000;
    }

    .contenedor.sidebar-abierto {
        width: 220px;
    }

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
        transition: opacity 0.2s ease 0.15s;
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