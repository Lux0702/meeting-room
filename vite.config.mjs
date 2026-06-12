// Plugins
import Vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import ViteFonts from "unplugin-fonts/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import Vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import tailwindcss from "@tailwindcss/vite";
// Utilities
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    Vue({
      template: { transformAssetUrls },
    }),
    tailwindcss(),
    Vuetify(),
    ViteFonts({
      google: {
        families: [
          {
            name: "Roboto",
            styles: "wght@100;300;400;500;700;900",
          },
        ],
      },
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    // Đã gộp 2 cấu hình Components bị trùng lặp lại thành 1
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  server: {
    host: "0.0.0.0", // 使服务器在局域网内可访问
    port: 8001,
    open: false, // 启动时自动打开浏览器
    hmr: {
      protocol: "ws", 
      // Đã bỏ `host: "localhost"`: Để trống để Vite tự nhận diện IP (giúp iPhone không bị lỗi disconnect HMR khi truy cập qua mạng LAN)
    },
    // CẤU HÌNH PROXY Ở ĐÂY
    proxy: {
      '/api': {
        target: 'http://192.168.71.18:8017', // Chỉ đường đến thẳng BE của bạn
        changeOrigin: true, // Đổi origin để tránh lỗi CORS
        secure: false,      // Tắt kiểm tra bảo mật SSL (do đang dùng HTTP)
        
        // NẾU BE của bạn KHÔNG CÓ chữ "/api" trong link (vd: http://192.168.71.18:8017/login), 
        // thì MỞ COMMENT dòng bên dưới để Vite tự xóa chữ "/api" trước khi gửi đi:
        // rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  },
});