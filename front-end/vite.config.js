import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import htmlToDjangoPlugin from './vite-plugin-html-to-django.js';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production';

  // Control source map generation via environment variable
  const shouldUseSourceMap = env.GENERATE_SOURCEMAP !== 'false';

  return {
    // Root directory for the project
    root: __dirname,

    // Public directory for static assets (copied as-is)
    publicDir: 'public',

    // Base public path - matches webpack's publicUrlOrPath
    base: '/static/compiled/',

    // Plugin configuration
    plugins: [
      // React plugin with automatic JSX runtime
      react({
        // Use automatic JSX runtime (React 17+)
        jsxRuntime: 'automatic',
        // Include .js files for JSX processing (CRA compatibility)
        include: '**/*.{jsx,js}',
      }),

      // SVG as React components
      // Matches webpack @svgr/webpack configuration
      svgr({
        svgrOptions: {
          // Match webpack svgr options (webpack.config.js lines 343-351)
          titleProp: true,
          ref: true,
          svgo: false, // Disable optimization
          svgoConfig: {
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    removeViewBox: false,
                  },
                },
              },
            ],
          },
        },
      }),

      // Custom plugin: Move HTML to Django templates directory
      // Matches webpack HtmlWebpackPlugin output to paths.builtHtmls
      htmlToDjangoPlugin(),
    ],

    // Module resolution
    resolve: {
      // File extensions to resolve
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],

      // Aliases - matches webpack configuration
      alias: {
        // Support React Native Web
        'react-native': 'react-native-web',
      },
    },

    // Build configuration
    build: {
      // Output directory - matches webpack's appBuild path
      outDir: path.resolve(__dirname, '../djsrc/static/compiled'),

      // Clean output directory before build
      emptyOutDir: true,

      // Generate source maps based on environment variable
      sourcemap: isProduction ? shouldUseSourceMap : true,

      // Inline assets smaller than 10KB (matches webpack imageInlineSizeLimit)
      assetsInlineLimit: 10000,

      // Generate manifest for asset mapping
      manifest: true,

      // Rollup options for fine-grained control
      rollupOptions: {
        output: {
          // File naming patterns to match webpack output structure

          // JavaScript files: js/[name].[hash].js
          entryFileNames: 'js/[name].[hash].js',

          // Code-split chunks: js/[name].[hash].chunk.js
          chunkFileNames: 'js/[name].[hash].chunk.js',

          // Asset files (CSS, images, fonts, etc.)
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];

            // CSS files: css/[name].[hash].css
            if (ext === 'css') {
              return 'css/[name].[hash][extname]';
            }

            // Images and other media: media/[name].[hash].[ext]
            // Matches webpack's media/ subdirectory
            return 'media/[name].[hash][extname]';
          },
        },
      },

      // CSS code splitting
      cssCodeSplit: true,

      // Target browsers (will use browserslist from package.json)
      target: 'es2015',

      // Minification options
      minify: isProduction ? 'esbuild' : false,

      // Build options for better compatibility
      cssMinify: isProduction,
    },

    // CSS preprocessing
    css: {
      // PostCSS configuration will be loaded from postcss.config.js
      postcss: './postcss.config.cjs',

      // CSS Modules configuration
      modules: {
        // Generate scoped class names in development for easier debugging
        generateScopedName: isDevelopment
          ? '[name]__[local]__[hash:base64:5]'
          : '[hash:base64:5]',
      },

      // Enable source maps for CSS
      devSourcemap: true,
    },

    // Server configuration (for development mode)
    server: {
      // Port configuration
      port: 3000,
      strictPort: false,

      // Open browser automatically
      open: false,
    },

    // ESBuild configuration to handle JSX in .js files (CRA compatibility)
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },

    // Optimize deps configuration
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },

    // Define environment variables
    // Vite automatically exposes VITE_* variables
    // We'll need to migrate REACT_APP_* to VITE_* in the code
    define: {
      // Make sure NODE_ENV is available
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  };
});
