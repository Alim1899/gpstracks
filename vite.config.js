import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => ({
  // HTTPS მხოლოდ ტელეფონზე ტესტირებისას
  plugins: [react(), mode === "phone" && basicSsl()].filter(Boolean),
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
}));