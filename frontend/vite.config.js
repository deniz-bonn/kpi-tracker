import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
    // shared/kpiConstants.json liegt außerhalb von frontend/ und wird von
    // KpiMitarbeiterBeta.jsx importiert — Dev-Server muss den Pfad ausliefern dürfen.
    fs: { allow: ['..'] },
  },
});
