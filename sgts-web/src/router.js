import { createRouter, createWebHistory } from 'vue-router';
import InicioComponent from './components/InicioComponent.vue';
import LoginComponent from './components/auth/LoginComponent.vue';
import RegisterComponent from './components/auth/RegisterComponent.vue';
import RequisitosComponent from './components/RequisitosComponent.vue';

import BeneficiarioComponent from './components/Beneficiario/BeneficiarioComponent.vue';
import BeneficiarioInicioComponent from './components/Beneficiario/BeneficiarioInicioComponent.vue';
import BeneficiarioTarjetaComponent from './components/Beneficiario/BeneficiarioTarjetaComponent.vue';
import BeneficiarioSolicitudComponent from './components/Beneficiario/BeneficiarioSolicitudComponent.vue';

import EmpleadoComponent from './components/Empleado/EmpleadoComponent.vue';
import Empleado_InicioComponent from './components/Empleado/InicioComponent.vue';
import Empleado_BeneficiariosComponent from './components/Empleado/BeneficiariosComponent.vue';
import Empleado_TarjetasComponent from './components/Empleado/TarjetasComponent.vue';
import Empleado_InformesComponent from './components/Empleado/InformesComponent.vue';
import Empleado_SolicitudesComponent from './components/Empleado/SolicitudesComponent.vue';

import AdminComponent from './components/Admin/AdminComponent.vue';
import AdminInicioComponent from './components/Admin/AdminInicioComponent.vue';
import AdminUsuariosComponent from './components/Admin/AdminUsuarioComponent.vue';

function getUserFromLocalStorage() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user;
}


const routes = [{
    path: '/',
    component: InicioComponent,
    meta: { requiresAuth: false },
},

{
    path: '/login',
    component: LoginComponent,
},
{
    path: '/registrar',
    component: RegisterComponent,
    meta: { requiresAuth: false },
},
{
    path: '/requisitos',
    component: RequisitosComponent,
    meta: { requiresAuth: false },
},
{
    path: '/admin',
    component: AdminComponent,
    meta: { requiresAuth: true, role: 2 },
    children: [
        {
            path: '',
            component: AdminInicioComponent,
            meta: {requiresAuth: true, role: 2}
        },
        {
            path: 'usuarios',
            component: AdminUsuariosComponent,
            meta: {requiresAuth: true, role:2}
        }
    ]
},
{
    path: '/empleado',
    component: EmpleadoComponent,
    meta: { requiresAuth: true, role: 1 },
    children: [
        {
            path: '',
            component: Empleado_InicioComponent,
            meta: { requiresAuth: true, role: 1 }
        },
        {
            path: 'beneficiarios',
            component: Empleado_BeneficiariosComponent,
            meta: { requiresAuth: true, role: 1 }
        },
        {
            path: 'tarjetas',
            component: Empleado_TarjetasComponent,
            meta: { requiresAuth: true, role: 1 }
        },
        {
            path: 'solicitudes',
            component: Empleado_SolicitudesComponent,
            meta: { requiresAuth: true, role: 1 }
        },
        {
            path: 'informes',
            component: Empleado_InformesComponent,
            meta: { requiresAuth: true, role: 1 }
        }
    ]
},
{
    path: '/beneficiario',
    component: BeneficiarioComponent,
    meta: { requiresAuth: true, role: 0 },
    children: [
        {
            path: '',
            component:BeneficiarioInicioComponent,
            meta: {requiresAuth: true, role: 0}
        },
        {
            path: 'solicitud',
            component:BeneficiarioSolicitudComponent,
            meta: {requiresAuth: true, role: 0}
        },
        {
            path: 'tarjeta',
            component:BeneficiarioTarjetaComponent,
            meta: {requiresAuth: true, role: 0}
        },
    ]
},
{
    path: '/:catchAll(.*)',
    redirect: '/'
  }

];

const router = createRouter({
    history: createWebHistory(),
    routes,
    linkActiveClass: "active",
    linkExactActiveClass: "active",
});
router.beforeEach((to, from, next) => {
    const user = getUserFromLocalStorage();

    if (to.path === '/login' && user) {
        // Usuario logueado, redirigir según rol
        switch (user.rol) {
            case 0:
                return next('/beneficiario');
            case 1:
                return next('/empleado');
            case 2:
                return next('/admin');
            default:
                return next(); // por si acaso
        }
    }

    // Verifica si la ruta requiere autenticación
    if (to.meta.requiresAuth) {
        if (!user) {
            return next('/login'); // No autenticado
        }

        // Verifica si el rol coincide
        if (to.meta.role !== undefined && to.meta.role !== user.rol) {
            return next('/login'); // Rol incorrecto
        }
    }

    return next(); // Si todo está bien, continuar
});



export default router;