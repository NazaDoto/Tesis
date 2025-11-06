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
        <span class="mensaje" v-text="mensaje"></span>
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
            <td>
              <div class="contenido-pequeno" v-html="n.contenido"></div>
            </td>
            <td>
              <input type="file" @change="onFileChange($event, n)" />
              <img v-if="n.imagen" :src="n.imagen" width="50" alt="Imagen" />
            </td>
            <td>{{ formatearFecha(n.fecha) }}</td>
            <td>
              <button class="btn-guardar" @click="abrirEditar(n)">Editar</button>
              <button class="btn-eliminar" @click="eliminarNoticia(n.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Agregar / Editar Noticia -->
    <div v-if="mostrarAgregar" class="modal-fondo">
      <div class="modal-contenido modal-grande">
        <div class="modal-header">
          <h4>{{ isEditing ? 'Editar Noticia' : 'Agregar Noticia' }}</h4>
          <button class="btn-cerrar" @click="cerrarAgregar">✕</button>
        </div>

        <input
          id="titulo"
          v-model="nuevaNoticia.titulo"
          placeholder="Título"
          class="input-tabla fullwidth"
        />

        <!-- Toolbar -->
        <div class="toolbar">
          <button type="button" @click.prevent="exec('bold')" title="Negrita"><b>B</b></button>
          <button type="button" @click.prevent="exec('italic')" title="Cursiva"><i>I</i></button>
          <button type="button" @click.prevent="exec('underline')" title="Subrayado"><u>U</u></button>

          <button type="button" @click.prevent="exec('insertUnorderedList')" title="Viñetas">•</button>
          <button type="button" @click.prevent="exec('insertOrderedList')" title="Numerada">1.</button>

          <button type="button" @click.prevent="exec('justifyLeft')" title="Alinear izquierda">⟸</button>
          <button type="button" @click.prevent="exec('justifyCenter')" title="Centrar">≡</button>
          <button type="button" @click.prevent="exec('justifyRight')" title="Alinear derecha">⟹</button>

          <label class="select-inline">
            Tamaño
            <select v-model="selectedFontSize" @change="applyFontSize">
              <option value="12">12</option>
              <option value="14">14</option>
              <option value="16">16</option>
              <option value="18">18</option>
              <option value="24">24</option>
            </select>
          </label>

          <input type="color" v-model="selectedColor" @input="applyColor" title="Color de texto" />

          <button type="button" @click.prevent="promptLink" title="Insertar enlace">🔗</button>

          <button type="button" @click.prevent="exec('undo')" title="Deshacer">↶</button>
          <button type="button" @click.prevent="exec('redo')" title="Rehacer">↷</button>
        </div>

        <!-- Editor -->
        <div
          ref="editor"
          class="editor"
          contenteditable="true"
          @input="onEditorInput"
          @keydown.enter.prevent="handleEnter"
          @paste.prevent="onPaste"
        ></div>

        <!-- Imagen destacada (preview) -->
        <div class="imagen-preview">
          <label class="label-file">Imagen destacada</label>
<input id="imagen" name="imagen" type="file" @change="onFileChangeNueva($event)" accept=".jpg,.png,.jpeg" />
          <div v-if="imagenPreview" class="preview-box">
            <img :src="imagenPreview" alt="Preview" />
            <button class="btn-eliminar" @click="removeImagenPreview">Quitar</button>
          </div>
        </div>

        <div class="actions">
          <button class="btn-guardar" @click="guardarNoticia">{{ isEditing ? 'Guardar' : 'Agregar' }}</button>
          <button class="btn" @click="cerrarAgregar">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/*
  Noticias.vue
  - Editor WYSIWYG ligero
  - Imagen destacada aparte con preview
  - Sanitización básica antes de enviar
*/
import axios from "axios";

export default {
  data() {
    return {
      cargando: false,
      mensajePopup: false,
      mensaje: "",
      noticias: [],
      mostrarAgregar: false,
      isEditing: false,
      editingId: null,

      // modelo de la noticia en modal
      nuevaNoticia: {
        titulo: "",
        contenido: "", // HTML
        imagenFile: null // imagen destacada
      },

      // preview de imagen destacada (dataURL)
      imagenPreview: null,

      // toolbar state
      selectedFontSize: "12",
      selectedColor: "#000000"
    };
  },
  methods: {
    // ---------------- utilidades ----------------
    formatearFecha(fecha) {
      return new Date(fecha).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit"
      });
    },

    // conv: html -> texto plano (mantiene saltos de línea)
    htmlToText(html) {
      const div = document.createElement("div");
      div.innerHTML = html || "";
      return div.innerText || "";
    },

    // sanitizador SIMPLE: elimina <script>, atributos on*, javascript: en href/src
    sanitizeHTML(dirty) {
      const container = document.createElement("div");
      container.innerHTML = dirty || "";

      // eliminar scripts y iframes
      container.querySelectorAll("script, iframe, object, embed").forEach((n) => n.remove());

      // limpiar atributos peligrosos
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, null, false);
      while (walker.nextNode()) {
        const el = walker.currentNode;
        // eliminar atributos que comienzan con "on"
        [...el.attributes].forEach((attr) => {
          const name = attr.name.toLowerCase();
          const val = attr.value || "";
          if (name.startsWith("on")) {
            el.removeAttribute(attr.name);
            return;
          }
          // bloquear javascript: en href/src
          if ((name === "href" || name === "src") && val.trim().toLowerCase().startsWith("javascript:")) {
            el.removeAttribute(attr.name);
            return;
          }
          // opcional: remover style inline si querés más restricción
          // if (name === "style") el.removeAttribute(attr.name);
        });
      }

      return container.innerHTML;
    },

    // ---------------- fetch / crud ----------------
    async fetchNoticias() {
      this.cargando = true;
      try {
        const res = await axios.get("/noticias/get");
        this.noticias = res.data[0] || [];
      } catch (e) {
        this.mensaje = "Error al cargar noticias. " + (e.message || e);
        this.mensajePopup = true;
      } finally {
        this.cargando = false;
      }
    },

    async eliminarNoticia(id) {
      try {
        await axios.post("/noticias/eliminar", { id, empleado: JSON.parse(localStorage.getItem('user')).usuario });
        this.mensaje = "Noticia eliminada";
        this.mensajePopup = true;
        this.fetchNoticias();
      } catch (e) {
        this.mensaje = "Error al eliminar noticia. " + (e.message || e);
        this.mensajePopup = true;
      }
    },

    // ---------------- modal open / close ----------------
    abrirAgregar() {
      this.isEditing = false;
      this.editingId = null;
      this.nuevaNoticia = { titulo: "", contenido: "", imagenFile: null };
      this.imagenPreview = null;
      this.mostrarAgregar = true;
      this.$nextTick(() => {
        // inicializamos editor vacío
        if (this.$refs.editor) {
          this.$refs.editor.innerHTML = "";
          this.$refs.editor.focus();
        }
      });
    },

    abrirEditar(n) {
      this.isEditing = true;
      this.editingId = n.id;
      this.nuevaNoticia.titulo = n.titulo || "";
      this.nuevaNoticia.contenido = n.contenido || "";
      this.nuevaNoticia.imagenFile = null; // no cambiar hasta que el usuario suba una nueva
      this.imagenPreview = n.imagen || null; // si tu API devuelve URL en n.imagen
      this.mostrarAgregar = true;
      this.$nextTick(() => {
        if (this.$refs.editor) {
          // cargamos contenido HTML en editor (no usar interpolation en template)
          this.$refs.editor.innerHTML = this.nuevaNoticia.contenido || "";
          this.$refs.editor.focus();
        }
      });
    },

    cerrarAgregar() {
      this.mostrarAgregar = false;
      this.isEditing = false;
      this.editingId = null;
      this.nuevaNoticia = { titulo: "", contenido: "", imagenFile: null };
      this.imagenPreview = null;
    },

    // ---------------- editor actions ----------------
    exec(command, value = null) {
      try {
        // intentamos styleWithCSS cuando esté disponible
        document.execCommand("styleWithCSS", false, true);
      } catch (e) {console.log(e)}
      document.execCommand(command, false, value);
      // mantener foco en editor
      this.$refs.editor && this.$refs.editor.focus();
    },

    applyFontSize() {
      // aplicamos tamaño envolviendo la selección en span con font-size
      const sizePx = this.selectedFontSize + "px";
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (range.collapsed) return;
      const span = document.createElement("span");
      span.style.fontSize = sizePx;
      try {
        range.surroundContents(span);
      } catch (e) {
        // fallback: execCommand fontSize (map to <font size>)
        document.execCommand("fontSize", false, 3);
        // convertir font a span luego en onEditorInput via cleanFontTags si fuera necesario
      }
      this.onEditorInput();
    },

    applyColor() {
      this.exec("foreColor", this.selectedColor);
    },

    promptLink() {
      const url = prompt("Ingrese la URL (ej: https://ejemplo.com):", "https://");
      if (url) {
        // si está vacío el selection, evitamos crear enlaces vacíos
        this.exec("createLink", url);
      }
    },

    // manejo de Enter: insertamos <br><br> para mantener separación y no crear tags extra raros
    handleEnter(e) {
  e.preventDefault(); // ahora “e” sí se usa
  document.execCommand("insertHTML", false, "<br><br>");
  this.onEditorInput();
}
,

    // on input: guardamos HTML en el modelo (luego sanitizamos antes de enviar)
    onEditorInput() {
      if (this.$refs.editor) {
        this.nuevaNoticia.contenido = this.$refs.editor.innerHTML;
      }
    },

    onPaste(e) {
      // pegar como texto plano preservando saltos de línea
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text");
      // convertimos saltos a <br>
      const html = (text || "").replace(/\n/g, "<br>");
      document.execCommand("insertHTML", false, html);
      this.onEditorInput();
    },

    // ---------------- imagen destacada (preview) ----------------
    onFileChangeNueva(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      this.nuevaNoticia.imagenFile = file;
      // preview
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.imagenPreview = ev.target.result;
      };
      reader.readAsDataURL(file);
    },

    removeImagenPreview() {
      this.imagenPreview = null;
      this.nuevaNoticia.imagenFile = null;
      // reset input file if present
      const input = document.getElementById("imagen");
      if (input) input.value = "";
    },

    onFileChange(e, noticia) {
      // para edición rápida desde la tabla: setear imagenFile y preview si querés
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      noticia.imagenFile = file;
    },

    // ---------------- guardar (agregar o editar) ----------------
    async guardarNoticia() {
      try {
        this.cargando = true;
        // sanitizamos el HTML
        const clean = this.sanitizeHTML(this.nuevaNoticia.contenido || "");
        const formData = new FormData();
        formData.append("titulo", this.nuevaNoticia.titulo || "");
        formData.append("contenido", clean);
        formData.append("empleado", JSON.parse(localStorage.getItem('user')).usuario);

        if (this.nuevaNoticia.imagenFile) {
          formData.append("imagen", this.nuevaNoticia.imagenFile);
        }

        if (this.isEditing && this.editingId) {
          formData.append("id", this.editingId);
          await axios.post("/noticias/editar", formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          this.mensaje = "Noticia actualizada correctamente.";
        } else {
          await axios.post("/noticias/agregar", formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          this.mensaje = "Noticia agregada correctamente.";
        }

        this.mensajePopup = true;
        this.cerrarAgregar();
        await this.fetchNoticias();
      } catch (e) {
        this.mensaje = "Error al guardar noticia. " + (e.message || e);
        this.mensajePopup = true;
      } finally {
        this.cargando = false;
      }
    }
  },

  mounted() {
    this.fetchNoticias();
  }
};
</script>

<style scoped>
/* Toolbar & editor styling */
.toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.toolbar button {
  background: #f6f6f6;
  border: 1px solid #ddd;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
}
.toolbar button:hover {
  background: #eee;
}
.select-inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

/* modal */
.modal-fondo {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-contenido {
  background: white;
  padding: 16px;
  border-radius: 8px;
  width: 90%;
  max-width: 1100px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.btn-cerrar {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

/* editor */
.editor {
  min-height: 240px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 6px;
  overflow: auto;
  margin-bottom: 10px;
  font-size: 14px;
  white-space: pre-wrap; /* ayuda a renderizar saltos cuando se pega texto */
}

/* imagen preview */
.imagen-preview {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.preview-box {
  display: flex;
  gap: 8px;
  align-items: center;
}
.preview-box img {
  max-width: 160px;
  max-height: 120px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
}

/* otros estilos heredados de tu archivo original */
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

.fullwidth {
  width: 100%;
  margin-bottom: 8px;
}
.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

/* popup message */
.mensaje-container-fondo {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.mensaje-container {
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  min-width: 220px;
  text-align: center;
}
.btn-mensaje {
  margin-top: 8px;
  padding: 6px 10px;
}

/* responsive */
@media (max-width: 700px) {
  .modal-contenido {
    width: 95%;
    padding: 12px;
  }
  .editor {
    min-height: 160px;
  }
}
</style>
