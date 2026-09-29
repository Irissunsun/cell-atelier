import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/build/three.core')) return 'three-core';
          if (id.includes('node_modules/three/build/three.module')) return 'three-renderer';
          if (id.includes('node_modules/three/')) return 'three-addons';
        },
      },
    },
  },
});
