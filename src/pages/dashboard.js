import { store } from '../store.js'
import { clienteService } from '../services/clienteService.js'
import { productoService } from '../services/productoService.js'
import { ventaService } from '../services/ventaService.js'

export class Dashboard {
  constructor() {
    this.stats = {
      totalClientes: 0,
      totalProductos: 0,
      totalVentas: 0,
      productosStockBajo: 0
    }
    this.chartInstance = null
    this.dateRangeStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    this.dateRangeEnd = new Date()
  }

  render() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}')
    return `
<div class="dashboard-page">
  <div class="page-header">
    <h1 class="page-title"><i class="fas fa-chart-line"></i> Panel principal</h1>
  </div>

  <div class="stats-grid">
    <div class="stat-card stat-card--clientes">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><h3>${this.stats.totalClientes}</h3><p>Total clientes</p></div>
        <i class="fas fa-users"></i>
      </div>
    </div>
    <div class="stat-card stat-card--productos">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><h3>${this.stats.totalProductos}</h3><p>Total productos</p></div>
        <i class="fas fa-box"></i>
      </div>
    </div>
    <div class="stat-card stat-card--ventas">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><h3>$${this.stats.totalVentas.toFixed(2)}</h3><p>Ventas del mes</p></div>
        <i class="fas fa-file-invoice-dollar"></i>
      </div>
    </div>
    <div class="stat-card stat-card--stock">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><h3>${this.stats.productosStockBajo}</h3><p>Stock bajo</p></div>
        <i class="fas fa-triangle-exclamation"></i>
      </div>
    </div>
  </div>

  <div class="welcome-panel">
    <h3><i class="fas fa-hand-sparkles"></i> Bienvenido al sistema</h3>
    <div class="welcome-meta">
      <p><i class="fas fa-user"></i> <strong>Usuario:</strong> ${userData.nombreUsuario || userData.nombreCompleto || 'Usuario'}</p>
      <p><i class="fas fa-user-shield"></i> <strong>Rol:</strong> ${userData.rol || 'Usuario'}</p>
      <p><i class="fas fa-calendar-day"></i> <strong>Fecha:</strong> ${new Date().toLocaleDateString('es-EC')}</p>
    </div>
    <p class="quick-actions-title"><i class="fas fa-bolt"></i> Accesos rápidos</p>
    <div class="quick-actions-grid">
      <button type="button" class="btn-quick-action btn-quick-action--primary" data-page="nuevaventa"><i class="fas fa-plus"></i> Nueva venta</button>
      <button type="button" class="btn-quick-action btn-quick-action--green" data-page="clientes"><i class="fas fa-users"></i> Clientes</button>
      <button type="button" class="btn-quick-action btn-quick-action--green-dark" data-page="productos"><i class="fas fa-box"></i> Productos</button>
      <button type="button" class="btn-quick-action btn-quick-action--muted" data-page="ventas"><i class="fas fa-file-invoice-dollar"></i> Facturas</button>
    </div>
  </div>

  <div class="chart-panel">
    <div class="chart-panel-header">
      <h3><i class="fas fa-chart-bar"></i> Ventas por día</h3>
      <div class="chart-filters">
        <label for="chartDateFrom">Desde</label>
        <input type="date" id="chartDateFrom" class="form-control" style="width:auto;padding:0.4rem 0.6rem"/>
        <label for="chartDateTo">Hasta</label>
        <input type="date" id="chartDateTo" class="form-control" style="width:auto;padding:0.4rem 0.6rem"/>
        <button type="button" id="btnApplyDateRange" class="btn btn-primary">Aplicar</button>
      </div>
    </div>
    <div class="chart-canvas-wrap">
      <canvas id="salesChart"></canvas>
    </div>
  </div>
</div>
    `
  }

  init() {
    console.log('[DASHBOARD] Inicializando...')
    this.loadStats()
    
    setTimeout(() => {
      document.querySelectorAll('.btn-quick-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault()
          const page = btn.getAttribute('data-page')
          if (window.router) window.router.navigateTo(page)
        })
      })

      // Cargar gráfico de ventas
      this.initializeSalesChart()
      
      // Event listeners para los date pickers
      const btnApply = document.getElementById('btnApplyDateRange')
      if (btnApply) {
        btnApply.addEventListener('click', () => this.updateSalesChart())
      }
    }, 100)
  }

  async loadStats() {
    try {
      console.log('[DASHBOARD] Cargando estadísticas desde backend...')
      
      // Cargar datos en paralelo
      const [clientes, productos, ventas] = await Promise.all([
        clienteService.getAll(),
        productoService.getAll(),
        ventaService.getAll()
      ])

      // Calcular estadísticas
      const totalVentas = Array.isArray(ventas) ? ventas.reduce((sum, v) => sum + (v.montoTotal || v.monto || 0), 0) : 0
      const stockBajo = Array.isArray(productos) ? productos.filter(p => (p.stockActual || p.stock || 0) <= (p.stockMinimo || 10)).length : 0

      this.stats = {
        totalClientes: Array.isArray(clientes) ? clientes.length : 0,
        totalProductos: Array.isArray(productos) ? productos.length : 0,
        totalVentas: totalVentas,
        productosStockBajo: stockBajo
      }

      console.log('[DASHBOARD] Estadísticas cargadas:', this.stats)
      
      // Actualizar UI
      this.updateStatsDisplay()
    } catch (error) {
      console.error('[DASHBOARD] Error cargando estadísticas:', error)
      this.stats = {
        totalClientes: 0,
        totalProductos: 0,
        totalVentas: 0,
        productosStockBajo: 0
      }
    }
  }

  updateStatsDisplay() {
    const clientesCard = document.querySelector('.stat-card--clientes h3')
    const productosCard = document.querySelector('.stat-card--productos h3')
    const ventasCard = document.querySelector('.stat-card--ventas h3')
    const stockCard = document.querySelector('.stat-card--stock h3')
    
    if (clientesCard) clientesCard.textContent = this.stats.totalClientes
    if (productosCard) productosCard.textContent = this.stats.totalProductos
    if (ventasCard) ventasCard.textContent = '$' + this.stats.totalVentas.toFixed(2)
    if (stockCard) stockCard.textContent = this.stats.productosStockBajo
  }

  async initializeSalesChart() {
    try {
      // Obtener ventas del período
      const ventas = await ventaService.getAll()
      console.log('[DASHBOARD] Ventas para gráfico:', ventas.length)
      
      // Setear fechas por defecto (últimos 30 días)
      const dateFromInput = document.getElementById('chartDateFrom')
      const dateToInput = document.getElementById('chartDateTo')
      
      if (dateFromInput && dateToInput) {
        const today = new Date()
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        
        dateFromInput.valueAsDate = thirtyDaysAgo
        dateToInput.valueAsDate = today
        
        this.dateRangeStart = thirtyDaysAgo
        this.dateRangeEnd = today
        
        console.log('[DASHBOARD] Rango por defecto:', thirtyDaysAgo.toLocaleDateString(), 'a', today.toLocaleDateString())
      }

      this.renderSalesChart(ventas)
    } catch (error) {
      console.error('[DASHBOARD] Error inicializando gráfico de ventas:', error)
    }
  }

  async updateSalesChart() {
    try {
      const dateFromInput = document.getElementById('chartDateFrom')
      const dateToInput = document.getElementById('chartDateTo')
      
      if (dateFromInput && dateToInput) {
        this.dateRangeStart = new Date(dateFromInput.value)
        this.dateRangeEnd = new Date(dateToInput.value)
        
        // Validar que la fecha inicial sea menor que la final
        if (this.dateRangeStart > this.dateRangeEnd) {
          Swal.fire({
            icon: 'warning',
            title: 'Validación',
            text: 'La fecha inicial debe ser menor que la fecha final',
            confirmButtonColor: '#4ea93b'
          })
          return
        }
      }
      
      const ventas = await ventaService.getAll()
      this.renderSalesChart(ventas)
    } catch (error) {
      console.error('[DASHBOARD] Error actualizando gráfico:', error)
    }
  }

  renderSalesChart(ventas) {
    // Agrupar ventas por día
    const salesByDay = {}
    
    // Asegurar que el rango de fechas incluye el día completo
    const rangeStart = new Date(this.dateRangeStart)
    rangeStart.setHours(0, 0, 0, 0)
    
    const rangeEnd = new Date(this.dateRangeEnd)
    rangeEnd.setHours(23, 59, 59, 999)
    
    console.log('[DASHBOARD] Filtrando ventas por rango:', rangeStart.toLocaleString('es-EC'), 'hasta', rangeEnd.toLocaleString('es-EC'))
    console.log('[DASHBOARD] Total de ventas a procesar:', ventas.length)
    
    let ventasEnRango = 0
    Array.isArray(ventas) && ventas.forEach((venta, index) => {
      const ventaDate = new Date(venta.fechaVenta)
      
      // Validar que la venta esté en el rango de fechas
      if (ventaDate >= rangeStart && ventaDate <= rangeEnd) {
        ventasEnRango++
        const dayKey = ventaDate.toLocaleDateString('es-EC')
        
        // Usar totalVenta como es el campo correcto según la estructura
        const monto = venta.totalVenta || 0
        
        if (salesByDay[dayKey]) {
          salesByDay[dayKey] += monto
        } else {
          salesByDay[dayKey] = monto
        }
      }
    })
    
    console.log('[DASHBOARD] Ventas en rango:', ventasEnRango)
    console.log('[DASHBOARD] Días con ventas:', Object.keys(salesByDay).length)

    // Crear array con todos los días en el rango (incluso si no hay ventas)
    const labels = []
    const data = []
    
    let currentDate = new Date(rangeStart)
    while (currentDate <= rangeEnd) {
      const dayKey = currentDate.toLocaleDateString('es-EC')
      labels.push(dayKey)
      const amount = salesByDay[dayKey] || 0
      data.push(amount)
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // Calcular máximo valor para ajustar eje Y
    const maxValue = Math.max(...data, 0)
    const yAxisMax = maxValue > 0 ? maxValue * 1.1 : 1000 // 10% más que el máximo o 1000 si no hay datos
    
    console.log('[DASHBOARD] Máximo valor de ventas:', maxValue)
    console.log('[DASHBOARD] Escala Y ajustada a:', yAxisMax)

    // Configurar Chart.js si está disponible
    const canvas = document.getElementById('salesChart')
    if (!canvas) {
      console.warn('[DASHBOARD] Canvas #salesChart no encontrado')
      return
    }

    // Destruir gráfico anterior si existe
    if (this.chartInstance) {
      this.chartInstance.destroy()
    }

    // Verificar si Chart está disponible
    if (typeof Chart === 'undefined') {
      console.warn('[DASHBOARD] Chart.js no está disponible. Asegúrate que esté cargado en index.html')
      return
    }

    const ctx = canvas.getContext('2d')
    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ventas ($)',
          data: data,
          backgroundColor: 'rgba(78, 169, 59, 0.75)',
          borderColor: 'rgba(78, 169, 59, 1)',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { size: 13, weight: '600' },
              color: '#64748B',
              padding: 15
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: yAxisMax,
            ticks: {
              color: '#64748B',
              font: { size: 12 },
              callback: function(value) {
                return '$' + value.toFixed(2)
              }
            },
            grid: {
              color: '#E2E8F0'
            }
          },
          x: {
            ticks: {
              color: '#64748B',
              font: { size: 11 },
              maxRotation: 45,
              minRotation: 0
            },
            grid: {
              color: '#E2E8F0'
            }
          }
        }
      }
    })
  }
}
