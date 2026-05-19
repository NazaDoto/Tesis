<template>
  <div class="vista">
    <LoadingOverlay :show="cargando" />
    <div v-if="mensajePopup" class="mensaje-container-fondo">
      <div class="mensaje-container">
        <span class="mensaje">{{ mensaje }}</span>
        <button class="btn-mensaje" @click="this.mensajePopup = false; this.mensaje = ''">Ok</button>

      </div>
    </div>
    <div v-if="tieneTarjeta != 'PENDIENTE'" class="container solicitud-beneficiario">
      <h3 class="titulo-seccion">Solicitar Tarjeta</h3>
      <p class="subtitulo-seccion">Completá tus datos. Los campos con * son obligatorios.</p>
      <form @submit.prevent="solicitar" class="formulario-beneficiario form-solicitud">
        <div class="fila">
          <div class="w-5">
            <label for="cuil" class="form-label">CUIL</label>
            <div class="flex-cuil">
              <!-- Prefijo editable (2 dígitos) -->
              <input class="form-control text-center cuil-lado" maxlength="2" type="text" inputmode="numeric"
                v-model="cuilInicio" @input="updateCuil" required />

              <!-- DNI no editable -->
              <span class="input-group-text cuil-medio">{{ usuario.dni }}</span>

              <!-- Verificador editable (1 dígito) -->
              <input class="form-control text-center cuil-lado" maxlength="1" type="text" inputmode="numeric"
                v-model="cuilFin" @input="updateCuil" required />
            </div>
          </div>
          <div class="w-5">
            <label for="nombre" class="form-label">Nombre completo</label>
            <input id="nombre" class="form-control" v-model="usuario.nombre" type="text" />
          </div>
        </div>
        <div class="fila">
          <div class="w-5">
            <label class="form-label" for="telefono">Teléfono</label>
            <input class="form-control" type="number" v-model="usuario.telefono" required>
          </div>
          <div class="w-5">
            <label for="sexo" class="form-label">Sexo</label>
            <select id="sexo" class="form-select" v-model="usuario.sexo">
              <option disabled value="default">Seleccione</option>
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
            </select>
          </div>
        </div>
        <div class="fila">
          <div class="w-5">
            <label class="form-label" for="fecha_nacimiento">Fecha de Nacimiento</label>
            <input class="form-control" type="date" v-model="usuario.fecha_nacimiento" required>
          </div>
          <div class="w-5">
            <label class="form-label" for="cant_parientes">Cantidad de parientes</label>
            <input type="number" class="form-control" v-model="usuario.cant_parientes" required>
          </div>
        </div>
        <div class="fila">
          <div class="w-5">
            <label for="archivo-dni" class="form-label">Foto/PDF del DNI</label>
            <input class="form-control" name="archivo-dni" type="file" accept=".jpeg, .png, .pdf" required>
          </div>
          <div class="w-5">
            <label for="archivo-historial-medico" class="form-label">Foto/PDF del Historial Médico</label>
            <input class="form-control" name="archivo-historial-medico" type="file" accept=".jpeg, .png, .pdf" required>
          </div>
        </div>

        <div class="fila">
          <div class="w-5">
            <label class="form-label" for="departamento">Departamento</label>
            <select class="form-select" v-model="usuario.departamento" @change="fetchLocalidades(usuario.departamento)"
              required>
              <option value="default" disabled>Seleccionar</option>
              <option :value="dpto.id" v-for="(dpto, index) in departamentos" :key="index">{{ dpto.descripcion
              }}
              </option>
            </select>
          </div>
          <div class="w-5">
            <label class="form-label" for="localidad">Localidad</label>
            <select class="form-select" v-model="usuario.localidad" :disabled="!(usuario.departamento != 'default')"
              @change="fetchBarrios(usuario.localidad)" required>
              <option value="default" disabled>Seleccionar</option>
              <option :value="localidad.id" v-for="(localidad, index) in localidades" :key="index">{{
                localidad.descripcion }}</option>
            </select>
          </div>
        </div>
        <div class="fila">
          <div class="w-5">
            <label class="form-label" for="barrio">Barrio</label>
            <select class="form-select" v-model="usuario.barrio" :disabled="!(usuario.localidad != 'default')" required>
              <option value="default" disabled>Seleccionar</option>
              <option :value="barrio.id" v-for="(barrio, index) in barrios" :key="index">{{ barrio.descripcion
              }}</option>
            </select>
          </div>
          <div class="w-5">
            <label for="domicilio" class="form-label">Domicilio</label>
            <input id="domicilio" class="form-control" v-model="usuario.domicilio" type="text" required />
          </div>
        </div>
        <div class="form-container pariente-card" v-for="i in usuario.cant_parientes" :key="i">
          <h5 class="pariente-titulo">Pariente {{ i }}</h5>
          <div class="fila">
            <div class="w-5">
              <label class="form-label" :for="'nom-pariente' + i">Nombre y Apellido</label>
              <input type="text" :name="'nom-pariente' + i" class="form-control"
                v-model="parientes[i - 1].nombre_pariente" required>
            </div>
            <div class="w-5">
              <label class="form-label" :for="'dni-pariente' + i">DNI</label>
              <input type="number" :name="'dni-pariente' + i" class="form-control"
                v-model="parientes[i - 1].dni_pariente" required>
            </div>
          </div>
          <div class="fila">
            <div class="w-5">
              <label class="form-label" :for="'sexo-pariente' + i">Sexo</label>
              <select :name="'sexo-pariente' + i" class="form-select" v-model="parientes[i - 1].sexo_pariente" required>
                <option value="default" disabled selected>Seleccionar</option>
                <option value="f">Femenino</option>
                <option value="m">Masculino</option>
                <option value="n">No binario</option>
              </select>
            </div>
            <div class="w-5">
              <label class="form-label" :for="'fecha-nacimiento-pariente' + i">Fecha de Nacimiento</label>
              <input type="date" :name="'fecha-nacimiento-pariente' + i" class="form-control"
                v-model="parientes[i - 1].fecha_nacimiento_pariente" required>
            </div>
          </div>
        </div>
        <div class="fila fila-acciones">
          <button type="submit" class="btn-mensaje btn-solicitar">Enviar solicitud</button>
        </div>

      </form>
    </div>
    <div v-else class="container solicitud-beneficiario solicitud-estado">
      <h3 class="titulo-seccion">Estado de la Solicitud</h3>
      <div class="solicitud-detalle">
        <!-- Datos principales -->
        <div class="solicitud-info">
          <div class="info-item">
            <span class="label">Número de Solicitud</span>
            <span class="value">{{ solicitud.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">Estado</span>
            <span class="value estado" :class="solicitud.estado ? 'estado-' + String(solicitud.estado).toLowerCase() : ''">
              {{ solicitud.estado }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">Fecha de Solicitud</span>
            <span class="value">{{ formatearFecha(solicitud.fecha_solicitud) }}</span>
          </div>
        </div>

        <!-- Historial -->
        <div v-if="solicitud.historial && solicitud.historial.length" class="historial">
          <h3 class="historial-titulo">Historial</h3>
          <div class="historial-encabezado">
            <span>Observaciones</span>
            <span>Fecha</span>
          </div>
          <div v-for="(historia, index) in solicitud.historial" :key="index" class="historial-item">
            <span>{{ historia.observaciones }}</span>
            <span>{{ formatearFecha(historia.fecha) }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
<script>
import router from '@/router';
import axios from 'axios';
import emitter from '@/eventBus';

export default {
  data() {
    return {
      cuilInicio: '',
      cuilFin: '',
      cargando: false,
      mensajePopup: false,
      usuario: {
        nombre: '',
        dni: '',
        cuil: '',
        sexo: 'default',
        telefono: '',
        fecha_nacimiento: '',
        cant_parientes: 0,
        localidad: 'default',
        departamento: 'default',
        barrio: 'default',
        domicilio: '',
      },
      parientes: [],
      localidades: [],
      departamentos: [],
      barrios: [],
      solicitud: '',
    }
  },
  props: {
    tieneTarjeta: {
      type: String,
      default: null
    }
  },
  watch: {
    "usuario.cant_parientes"(newVal) {
      if (newVal < 0) {
        this.usuario.cant_parientes = 0;
      } else {
        this.parientes = Array.from({ length: newVal }, (_, i) => ({
          nombre_pariente: this.parientes[i]?.nombre_pariente || "",
          dni_pariente: this.parientes[i]?.dni_pariente || "",
          fecha_nacimiento_pariente: this.parientes[i]?.fecha_nacimiento_pariente || "",
          sexo_pariente: this.parientes[i]?.sexo_pariente || "",
        }));
      }
    },
  },
  methods: {
    formatearFecha(fecha) {
      return new Date(fecha).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
    },
    updateCuil() {
      const inicio = this.cuilInicio.padStart(2, '0').slice(0, 2)
      const fin = this.cuilFin.slice(0, 1)
      const dni = this.usuario.dni
      this.usuario.cuil = `${inicio}${dni}${fin}`
    },
    restrictInput(event) {
      const input = event.target.value;
      // Expresión regular para buscar espacios y ciertos símbolos
      const restrictedChars = /[\s!@#$%^&*()_+=[\]{};':"\\|,<>?`´¨~¡/°¬¿]/g;
      if (restrictedChars.test(input)) {
        this.usuario.usuario = this.usuario.usuario.substring(0, this.usuario.usuario.length - 1);
      }
    },
    async solicitar() {
      this.cargando = true;
      try {
        const formData = new FormData();

        // Agregar datos usuario (los campos simples)
        for (const key in this.usuario) {
          formData.append(key, this.usuario[key]);
        }

        // Agregar parientes como JSON string
        formData.append('parientes', JSON.stringify(this.parientes));

        // Agregar archivos desde los inputs (accediendo por nombre)
        const archivoDni = this.$el.querySelector('input[name="archivo-dni"]').files[0];
        const archivoHistorial = this.$el.querySelector('input[name="archivo-historial-medico"]').files[0];

        if (archivoDni) formData.append('dni', archivoDni);
        if (archivoHistorial) formData.append('historial', archivoHistorial);
        if (JSON.parse(localStorage.getItem('user')).rol === '0'){
          formData.append('usuario', JSON.parse(localStorage.getItem('user')).usuario);
        }
        formData.append('empleado', JSON.parse(localStorage.getItem('user')).usuario || 'desconocido');
        // Enviar con axios usando multipart/form-data
        await axios.post('/tarjetas/solicitar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        router.push('/beneficiario');
      } catch (error) {
        this.mensajePopup = true;
        this.mensaje = ('Error al solicitar: ' + error.message);
      }
      finally{
        this.cargando = false;
      }
    },
    async fetchDepartamentos() {
      try {
        const response = await axios.get('/get/departamentos');
        this.departamentos = response.data;
      } catch (error) {
        console.error(error);
      }
    },
    async fetchLocalidades(id_dpto) {
      try {
        const response = await axios.get('/get/localidades', {
                    params: { id_dpto }
                });
        this.localidades = response.data;
        console.log(this.localidades, response)
        this.usuario.localidad = 'default';
        this.usuario.barrio = 'default';
      } catch (error) {
        console.error(error);
      }
    },
    async fetchBarrios(id_localidad) {
      try {
        const  response  = await axios.get('/get/barrios', {
                    params: { id_localidad }
                });
        this.barrios = response.data;
        this.usuario.barrio = 'default';
      } catch (error) {
        console.error(error);
      }
    },
    async fetchSolicitud(silencioso = false) {
      if (!silencioso) this.cargando = true;
      try {
        const response = await axios.get('/tarjetas/getSolicitud', {
          params: { dni: this.usuario.dni },
        });
        this.solicitud = response.data;
      } catch (error) {
        if (error.response) console.log(error.response.data);
      } finally {
        if (!silencioso) this.cargando = false;
      }
    },
    onDatosActualizados(data) {
      const miDni = String(this.usuario.dni || '');
      if (miDni && String(data?.dni) === miDni) {
        this.fetchSolicitud(true);
      }
    },
    async fetchDatos() {
      this.cargando = true;
      try {
        const response = await axios.get('/beneficiarios/getDatosPadron', { params: { dni: this.usuario.dni } });
        Object.assign(this.usuario, response.data);

      } catch (error) {
        console.log(error)
      }
      finally {
        this.cargando = false;
      }
    },
  },
  async mounted() {
    await this.fetchDepartamentos();
    this.usuario.dni = JSON.parse(localStorage.getItem('user')).dni;
    if (localStorage.getItem('tieneTarjeta') != null) {
      await this.fetchSolicitud();
    } else {
      await this.fetchDatos();
    }
    emitter.on('beneficiario_datos_actualizados', this.onDatosActualizados);
  },
  beforeUnmount() {
    emitter.off('beneficiario_datos_actualizados', this.onDatosActualizados);
  },
}
</script>
<style scoped>
.solicitud-detalle {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Sección de datos principales */
.solicitud-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e5e7eb;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.value {
  font-weight: 600;
  font-size: 1rem;
}

.estado {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
}

.estado-solicitada {
  background: #e6f0ff;
  color: #0056d6;
}

.estado-pendiente {
  background: #fff5e0;
  color: #c77700;
}

.estado-entregada {
  background: #e8ffe6;
  color: #0d8a2d;
}

.estado-baja {
  background: #ffe6e6;
  color: #c70000;
}

/* Historial estilo tabla */
.historial {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.historial-titulo {
  margin: 0;
  padding: 0.75rem 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
}

.historial-encabezado,
.historial-item {
  display: grid;
  grid-template-columns: 1fr 150px;
  padding: 0.75rem 1rem;
}

.historial-encabezado {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.historial-item {
  border-bottom: 1px solid #f3f4f6;
}

.historial-item:last-child {
  border-bottom: none;
}

.historial-item span {
  color: #4b5563;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.titulo-seccion {
  margin: 0.5rem 0 0.25rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: #2c2c87;
}

.subtitulo-seccion {
  margin: 0 0 1rem;
  font-size: 0.88rem;
  color: #6b7280;
  line-height: 1.4;
}

.form-solicitud :deep(.form-label) {
  margin-bottom: 0.35rem;
  font-size: 0.9rem;
}

.flex-cuil {
  display: grid;
  grid-template-columns: 3.25rem minmax(0, 1fr) 2.75rem;
  gap: 6px;
  width: 100%;
  align-items: stretch;
}

.flex-cuil .cuil-lado {
  width: 100%;
  min-width: 0;
  max-width: none !important;
  min-height: 42px;
  padding: 8px 4px !important;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  box-sizing: border-box;
}

.cuil-medio {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 42px;
  padding: 0 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #f3f4f6;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  box-sizing: border-box;
}

.pariente-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-sizing: border-box;
}

.pariente-titulo {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  color: #3e3eab;
}

.fila-acciones {
  margin-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.btn-solicitar {
  width: 100%;
  min-height: 48px;
  font-size: 1rem;
  font-weight: 600;
}

.flex-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 600px;
}

.c-black {
  color: black;
}

.logo-carga {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.texto-carga {
  color: black;
}

.form-container {
  width: 100%;
  background: white;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin: auto;
}

.titulo {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 15px;
}


.btn-container {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.btn-entrar {
  color: white;
  width: 100%;
  height: 50px;
  background: linear-gradient(rgb(175, 210, 255), rgb(0, 90, 207)) !important;
  font-size: large;
  border: none;
  border-radius: 5px;
  transition: background 0.3s;
}

.btn-entrar:hover {
  background: linear-gradient(rgb(175, 210, 255), rgb(0, 87, 168)) !important;
}

/* ——— Mobile (beneficiario: sidebar estrecho + vista angosta) ——— */
@media screen and (max-width: 991px) {
  .solicitud-beneficiario.container {
    padding: 12px 14px 28px;
    max-width: 100%;
    box-sizing: border-box;
  }

  .form-solicitud .fila {
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 0;
  }

  .form-solicitud .fila .w-5 {
    width: 100% !important;
    max-width: 100%;
    flex: 1 1 100%;
    margin-bottom: 14px;
  }

  .form-solicitud .form-control,
  .form-solicitud .form-select {
    width: 100%;
    min-height: 44px;
    font-size: 16px; /* evita zoom automático en iOS */
  }

  .form-solicitud input[type="file"].form-control {
    min-height: auto;
    padding: 10px 8px;
    font-size: 0.9rem;
  }

  .flex-cuil {
    grid-template-columns: 3rem minmax(0, 1fr) 2.5rem;
    gap: 6px;
  }

  .flex-cuil .cuil-lado {
    min-height: 44px;
    padding: 10px 2px !important;
    font-size: 1.125rem;
  }

  .cuil-medio {
    font-size: clamp(0.75rem, 3.2vw, 0.9rem);
    padding: 0 6px;
  }

  .pariente-card {
    width: 100% !important;
    padding: 14px 12px;
    margin: 0 0 12px;
  }

  .fila-acciones {
    position: sticky;
    bottom: 0;
    margin: 8px -14px 0;
    padding: 12px 14px 16px;
    background: linear-gradient(to top, #fff 85%, rgba(255, 255, 255, 0.95));
    border-top: 1px solid #e5e7eb;
    z-index: 5;
  }

  .btn-solicitar {
    box-shadow: 0 4px 12px rgba(0, 90, 207, 0.25);
  }

  /* Vista estado solicitud */
  .solicitud-estado .solicitud-info {
    grid-template-columns: 1fr;
  }

  .solicitud-estado .historial-encabezado {
    display: none;
  }

  .solicitud-estado .historial-item {
    grid-template-columns: 1fr;
    gap: 6px;
    padding: 12px 14px;
  }

  .solicitud-estado .historial-item span:first-child {
    font-weight: 500;
    line-height: 1.35;
  }

  .solicitud-estado .historial-item span:last-child {
    font-size: 0.82rem;
    color: #6b7280;
  }

  .solicitud-estado .historial-item span:last-child::before {
    content: 'Fecha: ';
    font-weight: 600;
  }
}

@media screen and (max-width: 380px) {
  .flex-cuil {
    grid-template-columns: 2.75rem minmax(0, 1fr) 2.25rem;
  }

  .flex-cuil .cuil-lado {
    font-size: 1.05rem;
    padding: 8px 2px !important;
  }

  .cuil-medio {
    font-size: 0.7rem;
    padding: 0 4px;
  }
}
</style>