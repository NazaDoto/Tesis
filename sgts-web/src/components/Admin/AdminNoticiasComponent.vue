<template>
  <div class="vista">
    <!-- Pantalla de carga -->
    <div v-if="cargando" class="pantalla-carga text-center">
      <div class="logo-carga">
        <img class="logo-img" src="/favicon.ico" width="50" alt="Logo" />
        <div class="texto-carga">Cargando...</div>
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

    <!-- Tabla de noticias -->
    <div class="container">
      <h3 class="mt-2">Gestión de Noticias</h3>

      <button class="btn-agregar" @click="abrirAgregar">Agregar Noticia</button>

      <table class="tabla-usuarios">
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Contenido</th>
            <th>Imagen</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in noticias" :key="n.id">
            <td>{{ n.id }}</td>
            <td><input v-model="n.titulo" class="input-tabla" /></td>
            <td><input v-model="n.contenido" class="input-tabla" /></td>
            <td>
              <input type="file" @change="onFileChange($event, n)" />
              <img v-if="n.imagen" :src="n.imagen" width="50" alt="Imagen" />
            </td>
            <td>{{ formatearFecha(n.fecha) }}</td>
            <td>
              <button class="btn-guardar" @click="editarNoticia(n)">Guardar</button>
              <button class="btn-eliminar" @click="eliminarNoticia(n.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Agregar Noticia -->
    <div v-if="mostrarAgregar" class="modal-fondo">
      <div class="modal-contenido">
        <h4>Agregar Noticia</h4>
        <input id="titulo" v-model="nuevaNoticia.titulo" placeholder="Título" class="input-tabla" />
        <textarea id="contenido" v-model="nuevaNoticia.contenido" placeholder="Contenido" class="input-tabla"></textarea>
        <input id="imagen" type="file" @change="onFileChangeNueva($event)" accept=".jpg, .png, .jpeg" />
        <div class="mt-2">
          <button class="btn-guardar" @click="agregarNoticia">Agregar</button>
          <button class="btn" @click="cerrarAgregar">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      cargando: false,
      mensajePopup: false,
      mensaje: "",
      noticias: [],
      nuevaNoticia: {
        titulo: "",
        contenido: "",
        imagen: null,
      },
      mostrarAgregar: false,
    };
  },
  methods: {
    formatearFecha(fecha) {
      return new Date(fecha).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    },
    async fetchNoticias() {
      this.cargando = true;
      try {
        const res = await axios.get("/noticias/get");
        this.noticias = res.data[0];
      } catch (e) {
        this.mensaje = "Error al cargar noticias." + e;
        this.mensajePopup = true;
      } finally {
        this.cargando = false;
      }
    },
    onFileChange(event, noticia) {
      noticia.imagenFile = event.target.files[0];
    },
    onFileChangeNueva(event) {
      this.nuevaNoticia.imagenFile = event.target.files[0];
    },
    abrirAgregar() {
      this.mostrarAgregar = true;
    },
    cerrarAgregar() {
      this.mostrarAgregar = false;
      this.nuevaNoticia = { titulo: "", contenido: "", imagen: null };
    },
    async agregarNoticia() {
      try {
        const formData = new FormData();
        formData.append("titulo", this.nuevaNoticia.titulo);
        formData.append("contenido", this.nuevaNoticia.contenido);
        if (this.nuevaNoticia.imagenFile)
          formData.append("imagen", this.nuevaNoticia.imagenFile);

        await axios.post("/noticias/agregar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        this.mensaje = "Noticia agregada correctamente.";
        this.mensajePopup = true;
        this.cerrarAgregar();
        this.fetchNoticias();
      } catch (e) {
        this.mensaje = "Error al agregar noticia." + e;
        this.mensajePopup = true;
      }
    },
    async editarNoticia(noticia) {
      try {
        const formData = new FormData();
        formData.append("id", noticia.id);
        formData.append("titulo", noticia.titulo);
        formData.append("contenido", noticia.contenido);
        if (noticia.imagenFile) formData.append("imagen", noticia.imagenFile);

        await axios.post("/noticias/editar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        this.mensaje = "Noticia actualizada correctamente.";
        this.mensajePopup = true;
        this.fetchNoticias();
      } catch (e) {
        this.mensaje = "Error al editar noticia." + e;
        this.mensajePopup = true;
      }
    },
    async eliminarNoticia(id) {
      try {
        await axios.post("/noticias/eliminar", { id });
        this.mensaje = "Noticia eliminada correctamente.";
        this.mensajePopup = true;
        this.fetchNoticias();
      } catch (e) {
        this.mensaje = "Error al eliminar noticia." + e;
        this.mensajePopup = true;
      }
    },
  },
  mounted() {
    this.fetchNoticias();
  },
};
</script>

<style scoped>
.tabla-usuarios {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.tabla-usuarios th,
.tabla-usuarios td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.tabla-usuarios th {
  background: #3e3eab;
  color: #fff;
}

.input-tabla {
  width: 90%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.btn-guardar,
.btn-agregar {
  background: #3e3eab;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin: 2px;
}

.btn-guardar:hover,
.btn-agregar:hover {
  background: #2c2c87;
}

.btn-eliminar {
  background: #ab3e3e;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-eliminar:hover {
  background: #871f1f;
}

.modal-fondo {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 8;
}

.modal-contenido {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
