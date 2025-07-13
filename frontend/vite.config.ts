import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { VantResolver } from "@vant/auto-import-resolver";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "path";

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? './' : "/",
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo-1.png", "logo.svg"],
      injectRegister: "auto",
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg}"],
      },
      manifest: {
        name: "CloudSaver",
        short_name: "CloudSaver",
        description: "网盘资源搜索工具",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "logo-1.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "logo.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
        ],
      },
    }),
    AutoImport({
      resolvers: [ElementPlusResolver(), VantResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver(), VantResolver()],
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/global.scss";`,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 8008,
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL_PROXY || "http://127.0.0.1:8009",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("Received Response:", proxyRes.statusCode, req.url);
          });
        },
      },
      "/tele-images": {
        target: process.env.VITE_API_BASE_URL_PROXY || "http://127.0.0.1:8009",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
      },
    },
  },
});
