import {defineConfig} from 'vite';
export default defineConfig({build:{rollupOptions:{output:{manualChunks:{three:['three'],graph:['cytoscape'],charts:['chart.js/auto'],motion:['framer-motion']}}}}});
