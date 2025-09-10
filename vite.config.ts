import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@styles': path.resolve(__dirname, './src/styles'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@views': path.resolve(__dirname, './src/views'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@interfaces': path.resolve(__dirname, './src/interfaces'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
  },
});
