import { defineConfig, loadEnv } from 'vite'
import path from 'path'

/** Origen del proxy /api en desarrollo (sin sufijo /api) */
function proxyTargetFromEnv(env) {
  if (env.VITE_API_PROXY_TARGET) {
    return env.VITE_API_PROXY_TARGET.replace(/\/api\/?$/i, '').replace(/\/+$/, '') || 'http://localhost:56398'
  }
  const base =
    env.VITE_API_BASE_URL ||
    env.VITE_API_URL ||
    'http://localhost:56398/api'
  return base.replace(/\/api\/?$/i, '') || 'http://localhost:56398'
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = proxyTargetFromEnv(env)

  return {
    appType: 'mpa',
    plugins: [],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (proxyTarget.includes('ngrok')) {
                proxyReq.setHeader('ngrok-skip-browser-warning', 'true')
              }
            })
          }
        }
      }
    },
    preview: {
      host: '0.0.0.0',
      port: Number(process.env.PORT) || 4173,
      strictPort: false,
      allowedHosts: true
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          login: path.resolve(__dirname, 'login.html')
        }
      }
    }
  }
})
