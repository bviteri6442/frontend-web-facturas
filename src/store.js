// Simple observable store pattern
export class Store {
  constructor() {
    this.state = {
      currentUser: null,
      currentPage: 'dashboard',
      isLoading: false
    }
    this.subscribers = []
  }

  getState() {
    return this.state
  }

  setState(newState) {
    this.state = { ...this.state, ...newState }
    this.notify()
  }

  subscribe(callback) {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }

  notify() {
    this.subscribers.forEach(callback => callback(this.state))
  }
}

export const store = new Store()

// Cargar usuario desde localStorage al iniciar
const userData = localStorage.getItem('currentUser')
if (userData) {
  try {
    store.setState({ currentUser: JSON.parse(userData) })
  } catch (error) {
    console.error('Error cargando usuario:', error)
  }
}
