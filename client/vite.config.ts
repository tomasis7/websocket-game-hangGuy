// This file defines the Vite configuration for the React client project.
// It sets up plugins for React and TailwindCSS, and configures a proxy for websocket traffic.
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()], // Enables React and TailwindCSS support
  server: {
    proxy: {
      "/socket.io": {
        target: "ws://localhost:3000", // Proxy websocket requests to the backend server
        ws: true, // Enable websocket proxying
      },
    },
  },
});
