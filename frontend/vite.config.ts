// import path from 'path';
// import checker from 'vite-plugin-checker';
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react-swc';

// // ----------------------------------------------------------------------

// const PORT = 3039;

// export default defineConfig({
//   plugins: [
//     react({
//       jsxImportSource: '@emotion/react',
//     }),
//     checker({
//       typescript: true,
//       eslint: {
//         useFlatConfig: true,
//         lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
//         dev: { logLevel: ['error'] },
//       },
//       overlay: {
//         position: 'tl',
//         initialIsOpen: false,
//       },
//     }),
//   ],
//   resolve: {
//     alias: [
//       {
//         find: /^src(.+)/,
//         replacement: path.resolve(process.cwd(), 'src/$1'),
//       },
//       {
//         find: /^@mui\/material\/styles/,
//         replacement: '@mui/material/styles',
//       },
//     ],
//   },
//   optimizeDeps: {
//     include: [
//       '@mui/material',
//       '@mui/icons-material',
//       '@emotion/react',
//       '@emotion/styled',
//     ],
//   },
//   server: {
//     port: PORT, host: true, allowedHosts: [
//       '.ngrok-free.app'
//     ]
//   },
//   preview: { port: PORT, host: true },
// });

import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// ----------------------------------------------------------------------

const PORT = 3039;

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        dev: { logLevel: ['error'] },
      },
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^src(.+)/,
        replacement: path.resolve(process.cwd(), 'src/$1'),
      },
      {
        find: /^@mui\/material\/styles/,
        replacement: '@mui/material/styles',
      },
    ],
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
    ],
  },
  server: {
    port: PORT,
    host: true,
    allowedHosts: ['.ngrok-free.app'],
    proxy: {
      '/api': {
        target: 'http://137.59.54.114:8101', // your backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // keep /api prefix
      },
    },
  },
  preview: { port: PORT, host: true },
});
