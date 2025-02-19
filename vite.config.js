import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensure relative paths for deployment
  build: {
    outDir: 'dist', // Default output directory
    assetsDir: 'assets',
    emptyOutDir: true, // Ensures old files are removed before building
  },
  server: {
    port: 3000,
    open: true,
  },
});
