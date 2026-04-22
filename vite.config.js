import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
            proxyReq.removeHeader('anthropic-dangerous-direct-browser-access');
          });
        }
      },
      '/api/grok': {
        target: 'https://api.x.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/grok/, ''),
        secure: true
      },
      // Gemini proxy — usa key do servidor (proxy.js) como fallback
      '/api/gemini': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gemini/, '/gemini'),
        secure: false
      }
    }
  }
})
