import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configure Vite's React support, including fast refresh during development.
export default defineConfig({
  plugins: [react()],
});
