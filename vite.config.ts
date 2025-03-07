import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/api': {
          target: mode === 'production'
            ? env.VITE_API_URL || 'https://your-api-url.com'
            : 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Define build-time env variable replacements
    define: {
      __API_URL__: JSON.stringify(mode === 'production'
        ? env.VITE_API_URL || 'https://your-api-url.com'
        : 'http://localhost:3000'
      ),
    },
  };
});
