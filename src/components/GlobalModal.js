/**
 * GlobalModal - Componente modal reutilizable global
 * Similar al componente Modal.vue de Vue
 */
export class GlobalModal {
  static instance = null

  static getInstance() {
    if (!GlobalModal.instance) {
      GlobalModal.instance = new GlobalModal()
    }
    return GlobalModal.instance
  }

  constructor() {
    this.modal = null
    this.isOpen = false
    this._init()
  }

  _init() {
    // Crear el modal si no existe
    if (!document.getElementById('globalModal')) {
      const modalHtml = `
        <div id="globalModal" class="global-modal-overlay">
          <div class="global-modal-dialog">
            <div class="global-modal-header">
              <h3 id="globalModalTitle">Modal</h3>
              <button type="button" id="globalModalClose" class="global-modal-close" aria-label="Cerrar">&times;</button>
            </div>
            <div id="globalModalBody"></div>
          </div>
        </div>
      `
      document.body.insertAdjacentHTML('beforeend', modalHtml)
    }

    this.modal = document.getElementById('globalModal')

    // Event listeners - Cerrar con botón X
    const closeBtn = document.getElementById('globalModalClose')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close())
    }

    // Clicks en el backdrop no cierran el modal (solo el botón X)
  }

  /**
   * Abre el modal con contenido específico
   * @param {string} title - Título del modal
   * @param {string} content - Contenido HTML del modal
   * @param {function} onClose - Callback al cerrar
   */
  open(title, content, onClose = null) {
    const titleEl = document.getElementById('globalModalTitle')
    const bodyEl = document.getElementById('globalModalBody')

    if (titleEl) {
      titleEl.textContent = title
    }

    if (bodyEl) {
      bodyEl.innerHTML = content
    }

    this.modal.style.display = 'flex'
    this.isOpen = true
    this.onClose = onClose

    console.log(`[MODAL GLOBAL] Abierto: ${title}`)
  }

  /**
   * Cierra el modal
   */
  close() {
    this.modal.style.display = 'none'
    this.isOpen = false

    if (this.onClose && typeof this.onClose === 'function') {
      this.onClose()
    }

    console.log('[MODAL GLOBAL] Cerrado')
  }

  /**
   * Obtiene el elemento body del modal para manipularlo
   */
  getBodyElement() {
    return document.getElementById('globalModalBody')
  }
}
