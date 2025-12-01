import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: "",

  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "Astronomy App",
        short_name: "Stars",
        description: "Приложение для расчёта углов наведения телескопа",
        theme_color: "#0d6efd",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait-primary",

        icons: [
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          }
        ]
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg}"],
      },
    })
  ],

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://192.168.1.51:9005',
        changeOrigin: true,
      },
      '/images': {
        target: 'http://192.168.1.51:9000',
        changeOrigin: true
      }
    }
  }
})