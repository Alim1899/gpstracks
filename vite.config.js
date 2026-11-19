import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import basicSsl from "@vitejs/plugin-basic-ssl";


export default defineConfig({
  plugins: [react(), basicSsl],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});