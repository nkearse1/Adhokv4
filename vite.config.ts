// vite.config.ts
import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    modules: ['node_modules'],
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      // Keep the specific supabaseClient alias for direct imports
      { find: '@supabase/supabaseClient',
        replacement: path.resolve(__dirname, 'supabase', 'supabaseClient.ts') },
      // Add alias for supabaseConfig to fix import resolution
      { find: '@supabase/supabaseConfig',
        replacement: path.resolve(__dirname, 'supabase', 'supabaseConfig.ts') },
    ],
  },

  optimizeDeps: { exclude: ['lucide-react'] },
  server: { /* your proxy/historyApiFallback */ },
  build: {
    rollupOptions: {
      output: { manualChunks: { vendor: ['react','react-dom','react-router-dom'] } },
    },
  },
  base: './',
})