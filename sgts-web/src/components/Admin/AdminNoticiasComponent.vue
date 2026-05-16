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

    <!-- Listado de noticias -->
    <div class="container admin-noticias">
      <div class="cabecera-noticias">
        <h3 class="titulo-seccion">Gestión de Noticias</h3>
        <button type="button" class="btn-agregar" @click="abrirAgregar">Agregar Noticia</button>
      </div>

      <div class="tabla-noticias-wrap">
        <table class="tabla-usuarios tabla-noticias">
          <thead>
            <tr>
              <th class="col-id">ID</th>
              <th class="col-titulo">Título</th>
              <th class="col-contenido">Resumen</th>
              <th class="col-imagen">Imagen</th>
              <th class="col-fecha">Fecha</th>
              <th class="col-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in noticias" :key="n.id">
              <td class="col-id">{{ n.id }}</td>
              <td class="col-titulo">
                <input v-model="n.titulo" class="input-tabla input-titulo-lista" type="text" />
              </td>
              <td class="col-contenido">
                <p class="contenido-preview" :title="htmlToText(n.contenido)">
                  {{ excerptContenido(n.contenido) }}
                </p>
              </td>
              <td class="col-imagen">
                <div class="celda-imagen">
                  <div v-if="thumbLista(n)" class="thumb-wrap">
                    <img :src="thumbLista(n)" class="thumb-mini" alt="" />
                  </div>
                  <div v-else class="thumb-placeholder">Sin imagen</div>
                  <label class="label-file-mini">
                    <span class="label-file-text">Cambiar</span>
                    <input
                      type="file"
                      class="input-file-oculto"
                      accept=".jpg,.jpeg,.png"
                      @change="onFileChange($event, n)"
                    />
                  </label>
                </div>
              </td>
              <td class="col-fecha">{{ formatearFecha(n.fecha) }}</td>
              <td class="col-acciones">
                <div class="acciones-fila">
                  <button type="button" class="btn-guardar" @click="abrirEditar(n)">Editar</button>
                  <button type="button" class="btn-eliminar" @click="eliminarNoticia(n.id)">Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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

        <!-- Imagen destacada + vista previa -->
        <div class="imagen-preview">
          <label class="label-file" for="imagen">Imagen destacada</label>
          <div class="fila-imagen-modal">
            <input
              id="imagen"
              name="imagen"
              type="file"
              class="input-file-visible"
              @change="onFileChangeNueva($event)"
              accept=".jpg,.png,.jpeg"
            />
            <div v-if="imagenPreview" class="preview-box">
              <img :src="imagenPreview" class="thumb-modal" alt="Vista previa" />
              <button type="button" class="btn-eliminar btn-quitar-thumb" @click="removeImagenPreview">
                Quitar
              </button>
            </div>
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
      this.nuevaNoticia.imagenFile = null;
      this.imagenPreview = n.imagen ? this.urlImagenPublica(n.imagen) : null;
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
      e.preventDefault();
      document.execCommand("insertHTML", false, "<br><br>");
      this.onEditorInput();
    },

    /** URL absoluta para imágenes guardadas bajo /uploads/... */
    urlImagenPublica(ruta) {
      if (!ruta) return "";
      if (ruta.startsWith("http") || ruta.startsWith("data:")) return ruta;
      const base = (axios.defaults.baseURL || "").replace(/\/$/, "");
      const p = ruta.startsWith("/") ? ruta : `/${ruta}`;
      return base ? `${base}${p}` : p;
    },

    excerptContenido(html, max = 140) {
      const t = this.htmlToText(html).replace(/\s+/g, " ").trim();
      if (!t) return "—";
      return t.length > max ? `${t.slice(0, max)}…` : t;
    },

    thumbLista(n) {
      if (n.imagenPreviewLocal) return n.imagenPreviewLocal;
      if (n.imagen) return this.urlImagenPublica(n.imagen);
      return "";
    },

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
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      noticia.imagenFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => {
        noticia.imagenPreviewLocal = ev.target.result;
      };
      reader.readAsDataURL(file);
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
/* Listado */
.admin-noticias {
  max-width: 100%;
}
.cabecera-noticias {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}
.titulo-seccion {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: #2c2c87;
}
.tabla-noticias-wrap {
  overflow-x: auto;
  margin-top: 12px;
  border-radius: 8px;
  border: 1px solid #e2e2f0;
  background: #fafbff;
}
.tabla-noticias {
  min-width: 720px;
  margin-top: 0;
}
.tabla-noticias .col-titulo,
.tabla-noticias .col-contenido {
  text-align: left;
}
.tabla-noticias thead .col-titulo,
.tabla-noticias thead .col-contenido {
  text-align: left;
}
.col-id {
  width: 52px;
  white-space: nowrap;
}
.col-titulo {
  min-width: 160px;
  max-width: 220px;
  text-align: left;
}
.col-contenido {
  min-width: 200px;
  max-width: 320px;
  text-align: left;
}
.contenido-preview {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.35;
  color: #374151;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.col-imagen {
  width: 128px;
  min-width: 128px;
}
.celda-imagen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}
.thumb-wrap {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #d6d6ea;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb-mini {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  border: 1px dashed #c4c4dd;
  background: #f3f4f6;
  font-size: 0.65rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.2;
  padding: 4px;
}
.label-file-mini {
  position: relative;
  display: inline-block;
  cursor: pointer;
  margin: 0;
}
.label-file-text {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #3e3eab;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #3e3eab;
  background: #fff;
}
.label-file-mini:hover .label-file-text {
  background: #eef0ff;
}
.input-file-oculto {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
}
.input-titulo-lista {
  width: 100%;
  max-width: 100%;
}
.col-fecha {
  white-space: nowrap;
  width: 92px;
  font-size: 0.85rem;
}
.col-acciones {
  width: 1%;
  white-space: nowrap;
}
.acciones-fila {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: stretch;
}
.acciones-fila .btn-guardar,
.acciones-fila .btn-eliminar {
  margin: 0;
  width: 100%;
  min-width: 88px;
}

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

/* imagen preview modal */
.label-file {
  font-weight: 600;
  font-size: 0.9rem;
  color: #374151;
  margin-bottom: 4px;
  display: block;
}
.fila-imagen-modal {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px;
}
.input-file-visible {
  flex: 1;
  min-width: 200px;
  font-size: 0.85rem;
}
.imagen-preview {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.preview-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.thumb-modal {
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.btn-quitar-thumb {
  padding: 4px 10px;
  font-size: 0.8rem;
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
.btn-agregar {
  flex-shrink: 0;
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
.actions .btn {
  background: #e5e7eb;
  color: #1f2937;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.actions .btn:hover {
  background: #d1d5db;
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
