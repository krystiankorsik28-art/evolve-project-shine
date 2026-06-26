import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^framer-motion$/,
        replacement: fileURLToPath(new URL("./node_modules/framer-motion/dist/cjs/index.js", import.meta.url)),
      },
      {
        find: /^hls\.js$/,
        replacement: fileURLToPath(new URL("./node_modules/hls.js/dist/hls.js", import.meta.url)),
      },
      {
        find: /^ai$/,
        replacement: fileURLToPath(new URL("./node_modules/ai/dist/index.js", import.meta.url)),
      },
    ],
  },
  plugins: [
    ...tanstackStart(),
    react(),
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    nitro({ preset: "vercel" }),
  ],
});
