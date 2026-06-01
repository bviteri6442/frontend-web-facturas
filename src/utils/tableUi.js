/** Rellena filas vacías para altura fija de tablas paginadas */
export function padTableBodyHtml(rowHtml, targetRows, colspan) {
  const rows = rowHtml ? [rowHtml] : []
  const count = (rowHtml.match(/<tr/gi) || []).length
  let html = rowHtml || ''
  for (let i = count; i < targetRows; i++) {
    html += `<tr class="table-pad-row" aria-hidden="true"><td colspan="${colspan}" style="height:52px;border:none;background:transparent;"></td></tr>`
  }
  return html
}
