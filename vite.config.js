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
      secure: true
    },
    '/api/grok': {
      target: 'https://api.x.ai',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/grok/, ''),
      secure: true
    }
  }
}
})