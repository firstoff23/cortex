import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __BUILD_NUM__: JSON.stringify(Date.now().toString(36).slice(-4).toUpperCase())
    },
    server: {
      proxy: {
        '/api/groq': {
          target: 'https://api.groq.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/groq/, ''),
          secure: true
        },
        '/api/claude': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/claude/, ''),
          secure: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.removeHeader('anthropic-dangerous-direct-browser-access')
            })
          }
        },
        '/api/grok': {
          target: 'https://api.x.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/grok/, ''),
          secure: true
        },
        '/api/gemini': {
          target: 'http://localhost:3333',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/gemini/, '/gemini'),
          secure: false
        },
        '/api/chat': {
          target: 'https://openrouter.ai',
          changeOrigin: true,
          rewrite: () => '/api/v1/chat/completions',
          secure: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const key = env.OPENROUTER_API_KEY
              if (key) {
                proxyReq.setHeader('Authorization', `Bearer ${key}`)
                proxyReq.setHeader('HTTP-Referer', 'https://cortex-digital.vercel.app')
                proxyReq.setHeader('X-Title', 'Cortex Digital')
              }
            })
          }
        }
      }
    }
  }
})
