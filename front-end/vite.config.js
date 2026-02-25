import { defineConfig, loadEnv, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { injectAssetsIntoDjangoTemplates } from './vite-plugin-inject-django.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production';
  const shouldUseSourceMap = env.GENERATE_SOURCEMAP !== 'false';

  return {
    root: __dirname,
    publicDir: 'public',
    base: '/static/compiled/',

    plugins: [
      // Treat .js files as JSX. Runs before other plugins so Rolldown's
      // parser sees valid JS, not raw JSX syntax. Required because Vite 7
      // uses Rolldown which doesn't natively handle JSX in .js files.
      {
        name: 'js-jsx-transform',
        enforce: 'pre',
        async transform(code, id) {
          if (/\.js$/.test(id) && !id.includes('node_modules')) {
            return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' });
          }
        },
      },
      react({
        jsxRuntime: 'automatic',
        include: '**/*.{jsx,js}',
      }),
      injectAssetsIntoDjangoTemplates({ mode }),
    ],

    resolve: {
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
      alias: {
        'src': path.resolve(__dirname, 'src'),
        'react-native': 'react-native-web',
      },
    },

    build: {
      outDir: path.resolve(__dirname, '../djsrc/static/compiled'),
      emptyOutDir: true,
      sourcemap: isProduction ? (shouldUseSourceMap ? 'hidden' : false) : 'hidden',
      assetsInlineLimit: 10000,
      manifest: true,

      rollupOptions: {
        input: {
          mainApp:      path.resolve(__dirname, 'src/index.jsx'),
          demoMicroApp: path.resolve(__dirname, 'src/micro-apps/demo/index.js'),
        },
        output: {
          entryFileNames: 'js/[name].[hash].js',
          chunkFileNames: 'js/[name].[hash].chunk.js',
          assetFileNames: (assetInfo) => {
            const ext = assetInfo.name?.split('.').pop();
            if (ext === 'css') return 'css/[name].[hash][extname]';
            return 'media/[name].[hash][extname]';
          },
        },
      },

      cssCodeSplit: true,
      target: 'es2015',
      minify: isProduction ? 'esbuild' : false,
      cssMinify: isProduction,
    },

    css: {
      postcss: './postcss.config.cjs',
      modules: {
        generateScopedName: isDevelopment
          ? '[name]__[local]__[hash:base64:5]'
          : '[hash:base64:5]',
      },
      devSourcemap: true,
    },

    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  };
});
