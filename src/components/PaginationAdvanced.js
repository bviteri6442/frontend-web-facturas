// Paginación avanzada — estilos en main.css (.pagination-advanced)
export class PaginationAdvanced {
  constructor(options = {}) {
    this.currentPage = options.currentPage || 1
    this.totalPages = options.totalPages || 1
    this.totalItems = options.totalItems || 0
    this.itemsPerPage = options.itemsPerPage || 10
    this.onChange = options.onChange || (() => {})
  }

  update(totalItems) {
    this.totalItems = totalItems
    this.totalPages = Math.ceil(totalItems / this.itemsPerPage)
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages
    }
  }

  goToFirst() {
    if (this.currentPage !== 1) {
      this.currentPage = 1
      this.onChange(this.currentPage)
    }
  }

  goToLast() {
    if (this.currentPage !== this.totalPages) {
      this.currentPage = this.totalPages
      this.onChange(this.currentPage)
    }
  }

  goToPrevious() {
    if (this.currentPage > 1) {
      this.currentPage--
      this.onChange(this.currentPage)
    }
  }

  goToNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++
      this.onChange(this.currentPage)
    }
  }

  movePages(delta) {
    const newPage = this.currentPage + delta
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage
      this.onChange(this.currentPage)
    }
  }

  goToPage(page) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page
      this.onChange(this.currentPage)
    }
  }

  getPageNumbers() {
    const pages = []
    const start = Math.max(1, this.currentPage - 5)
    const end = Math.min(this.currentPage - 1, this.totalPages)
    for (let i = start; i <= end && pages.length < 5; i++) {
      pages.push(i)
    }
    return pages
  }

  getRightPageNumbers() {
    const pages = []
    const start = Math.min(this.currentPage + 1, this.totalPages)
    const end = Math.min(this.currentPage + 5, this.totalPages)
    for (let i = start; i <= end && pages.length < 5; i++) {
      pages.push(i)
    }
    return pages
  }

  hasLeftGap() {
    const leftPages = this.getPageNumbers()
    return leftPages.length > 0 && leftPages[leftPages.length - 1] < this.currentPage - 1
  }

  hasRightGap() {
    const rightPages = this.getRightPageNumbers()
    return rightPages.length > 0 && rightPages[0] > this.currentPage + 1
  }

  _btn(label, onclick, disabled, extraClass = '') {
    const dis = disabled ? ' disabled' : ''
    return `<button type="button" class="pag-btn${dis} ${extraClass}" onclick="${onclick}" ${disabled ? 'disabled' : ''}>${label}</button>`
  }

  render() {
    const leftPages = this.getPageNumbers()
    const rightPages = this.getRightPageNumbers()
    const c = this.currentPage
    const t = this.totalPages

    return `
    <div class="pagination-advanced">
      <div class="pagination-controls">
        ${this._btn('<i class="fas fa-angles-left"></i> Primera', 'window.pagination.goToFirst()', c === 1, 'pag-btn--primary')}
        ${this._btn('−1000', 'window.pagination.movePages(-1000)', c <= 1000, 'pag-btn--jump')}
        ${this._btn('−100', 'window.pagination.movePages(-100)', c <= 100, 'pag-btn--jump')}
        ${this._btn('−10', 'window.pagination.movePages(-10)', c <= 10, 'pag-btn--jump')}
        ${this._btn('<i class="fas fa-chevron-left"></i> Anterior', 'window.pagination.goToPrevious()', c === 1, 'pag-btn--primary')}

        <div class="pagination-numbers">
          ${leftPages.map(page => `<button type="button" class="pag-num" onclick="window.pagination.goToPage(${page})">${page}</button>`).join('')}
          ${this.hasLeftGap() ? '<span class="pag-ellipsis">…</span>' : ''}
          <button type="button" class="pag-num pag-num--active" disabled>${c}</button>
          ${this.hasRightGap() ? '<span class="pag-ellipsis">…</span>' : ''}
          ${rightPages.map(page => `<button type="button" class="pag-num" onclick="window.pagination.goToPage(${page})">${page}</button>`).join('')}
        </div>

        ${this._btn('Siguiente <i class="fas fa-chevron-right"></i>', 'window.pagination.goToNext()', c === t, 'pag-btn--primary')}
        ${this._btn('+10', 'window.pagination.movePages(10)', c + 10 > t, 'pag-btn--jump')}
        ${this._btn('+100', 'window.pagination.movePages(100)', c + 100 > t, 'pag-btn--jump')}
        ${this._btn('+1000', 'window.pagination.movePages(1000)', c + 1000 > t, 'pag-btn--jump')}
        ${this._btn('Última <i class="fas fa-angles-right"></i>', 'window.pagination.goToLast()', c === t, 'pag-btn--primary')}
      </div>
      <p class="pagination-info">
        Página <strong>${c}</strong> de <strong>${t}</strong>
        <span class="pag-sep">·</span>
        Total: <strong>${this.totalItems}</strong> registros (${this.itemsPerPage} por página)
      </p>
    </div>`
  }
}
