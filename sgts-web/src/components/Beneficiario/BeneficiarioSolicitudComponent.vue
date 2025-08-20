<template>
  <div class="vista">
    <div v-if="cargando" class="pantalla-carga text-center">
      <div class="logo-carga">
        <img class="logo-img" src="/favicon.ico" width="50" alt="Logo" />
        <div class="texto-carga">Cargando</div>
      </div>
    </div>
    <div v-if="mensajePopup" class="mensaje-container-fondo">
      <div class="mensaje-container">
        <span class="mensaje">{{ mensaje }}</span>
        <button class="btn-mensaje" @click="this.mensajePopup = false; this.mensaje = ''">Ok</button>

      </div>
    </div>
    <div v-if="tieneTarjeta != 'PENDIENTE'" class="container">
      <h3 class="mt-2">Solicitar Tarjeta</h3>
      <form @submit.prevent="solicitar" class="formulario-beneficiario">
        <div class="fila">
          <div class="w-5">
            <label for="cuil" class="form-label">CUIL</label>
            <div class="flex-cuil">
              <!-- Prefijo editable (2 dígitos) -->
              <input class="form-control text-center cuil-lado" maxlength="2" type="text" v-model="cuilInicio"
                @input="updateCuil" style="max-width: 3em;" required />

              <!-- DNI no editable -->
              <span class="input-group-text cuil-medio">{{ usuario.dni }}</span>

              <!-- Verificador editable (1 dígito) -->
              <input class="form-control text-center cuil-lado" maxlength="1" type="text" v-model="cuilFin"
                @input="updateCuil" style="max-width: 3em;" required />
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
              <option :value="dpto.cod_dpto" v-for="(dpto, index) in departamentos" :key="index">{{ dpto.descripcion
              }}
              </option>
            </select>
          </div>
          <div class="w-5">
            <label class="form-label" for="localidad">Localidad</label>
            <select class="form-select" v-model="usuario.localidad" :disabled="!(usuario.departamento != 'default')"
              @change="fetchBarrios(usuario.localidad)" required>
              <option value="default" disabled>Seleccionar</option>
              <option :value="localidad.cod_localidad" v-for="(localidad, index) in localidades" :key="index">{{
                localidad.descripcion }}</option>
            </select>
          </div>
        </div>
        <div class="fila">
          <div class="w-5">
            <label class="form-label" for="barrio">Barrio</label>
            <select class="form-select" v-model="usuario.barrio" :disabled="!(usuario.localidad != 'default')" required>
              <option value="default" disabled>Seleccionar</option>
              <option :value="barrio.cod_barrio" v-for="(barrio, index) in barrios" :key="index">{{ barrio.descripcion
              }}</option>
            </select>
          </div>
          <div class="w-5">
            <label for="domicilio" class="form-label">Domicilio</label>
            <input id="domicilio" class="form-control" v-model="usuario.domicilio" type="text" required />
          </div>
        </div>
        <div class="form-container" v-for="i in usuario.cant_parientes" :key="i">
          <h5>Pariente {{ i }}</h5>
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
        <div class="fila m-4">
          <button type="submit" class="btn-mensaje">Solicitar</button>
        </div>

      </form>
    </div>
    <div v-else class="container">
      <h3 class="mt-2">Estado de la Solicitud</h3>
      <div class="solicitud-detalle">
        <!-- Datos principales -->
        <div class="solicitud-info">
          <div class="info-item">
            <span class="label">Número de Solicitud</span>
            <span class="value">{{ solicitud.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">Estado</span>
            <span class="value">
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

        // Enviar con axios usando multipart/form-data
        await axios.post('/tarjetas/solicitar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        router.push('/beneficiario');
      } catch (error) {
        this.mensajePopup = true;
        this.mensaje = ('Error al solicitar: ' + error);
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
    async fetchLocalidades(cod_dpto) {
      try {
        const response = await axios.get(`/get/localidades/${cod_dpto}`);
        this.localidades = response.data;
        this.usuario.localidad = 'default';
        this.usuario.barrio = 'default';
      } catch (error) {
        console.error(error);
      }
    },
    async fetchBarrios(cod_localidad) {
      try {
        const response = await axios.get(`/get/barrios/${cod_localidad}`);
        this.barrios = response.data;
        this.usuario.barrio = 'default';
      } catch (error) {
        console.error(error);
      }
    },
    async fetchSolicitud() {
      
      try {
        const response = await axios.get('/tarjetas/getSolicitud', { params: { dni: this.usuario.dni } });
        this.solicitud = response.data;
      } catch (error) {
        console.log(error.response.data)
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
    this.usuario.dni = await JSON.parse(localStorage.getItem('user')).dni;
    if (localStorage.getItem('tieneTarjeta') != null) {
      await this.fetchSolicitud();
    } else {     
      await this.fetchDatos();
    }
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

.flex-cuil {
  display: inline-flex;
  width: 100%;
  flex-direction: row;
}

.cuil-lado {
  width: 20%;
  max-width: none !important;
}

.cuil-medio {
  width: 60%;
  justify-content: center !important;
}

.form-control.text-center {
  text-align: center;
  padding: 0 !important;
}

.flex-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 600px;
}

.pantalla-carga {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: rgba(255, 255, 255, 0.9);
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

@media screen and (max-width: 768px) {
  .form-container {
    width: 90%;
  }
}
</style>