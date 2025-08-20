<template>
    <div>
        <div class="ancho-pag mt-4">
            <h3 class="text-center"><strong>Requisitos</strong></h3>
            <p>Aquellas personas que busquen adherirse al programa de Tarjetas Sociales deberán:</p>
            <ul>
                <li>No contar con ingresos por trabajo activo.</li>
                <li>No contar con ingresos por jubilación.</li>
                <li>No contar con ingresos por pensión.</li>
                <li>No contar con la Tarjeta Alimentar Nacional.</li>
            </ul>
            <p>Luego de cumplir con esos requerimientos, deberán contar con:</p>
            <ol>
                <li>Fotografía legible del DNI (anverso y reverso).</li>
                <li>Fotografía o PDF del Historial médico.</li>
            </ol>
            <div class="text-center">
                <router-link class="btn-css c-black" to="/solicitar-tarjeta"><strong>SOLICITAR TARJETA</strong></router-link>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    components: {
    }
}
</script>

<style>
.c-black{
    color:black !important;
}
.white {
    color: white;
}

.btn-css-solicitar {
    font-size: 1.4rem;
    font-weight: bold;
    color: rgb(101, 201, 255);
    padding: 10px;
}
</style>