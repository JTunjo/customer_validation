import { defineConfig } from "vite";

// Para GitHub Pages en un repo normal (https://usuario.github.io/nombre-repo/)
// hay que usar base: "/nombre-repo/". Lo dejamos configurable por variable de entorno
// para no tener que tocar el código cuando cambie el nombre del repositorio.
export default defineConfig({
  base: process.env.VITE_BASE || "./",
  build: {
    outDir: "dist",
  },
});
