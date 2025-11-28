# Vite Port Requirements - Complete Checklist

This document outlines all requirements for porting the webpack-based build system to Vite for the Django-React integration project. Compiled by Claude Code. 

**Based on analysis of 110 webpack features**

---

## 🔴 CRITICAL REQUIREMENTS (Must Have)

### 1. Output Structure & Paths

- ✅ Build static assets (JS, CSS, images) to: `../djsrc/static/compiled/`
- ✅ Move generated HTML file to: `../djsrc/templates/react/index.html`
- ✅ Set base public path to: `/static/compiled/`
- ✅ Clear output directory before each build
- ✅ Copy files from `public/` folder to output (excluding index.html)

### 2. JavaScript/TypeScript Processing

- ✅ Transpile JSX/TSX files (React)
- ✅ Support both `.js`, `.jsx`, `.ts`, `.tsx` file extensions
- ✅ Support React 17+ automatic JSX runtime (no `import React` needed)
- ✅ Minify JavaScript in production builds
- ✅ Generate source maps (configurable via environment variable)
- ✅ Code splitting with dynamic imports
- ✅ Content-based file hashing for cache busting

### 3. CSS/SCSS Processing

- ✅ Import and bundle CSS files
- ✅ Support CSS Modules (`.module.css` files)
- ✅ Support SASS/SCSS (`.scss`, `.sass` files)
- ✅ Support SCSS Modules (`.module.scss`, `.module.sass` files)
- ✅ PostCSS processing with plugins:
  - `postcss-flexbugs-fixes`
  - `postcss-preset-env` (with autoprefixer, stage 3)
  - `postcss-normalize`
- ✅ Extract CSS to separate files in production
- ✅ Inject CSS via `<style>` tags in development
- ✅ Minify CSS in production

### 4. SVG Handling ⚠️ CRITICAL

- ✅ Import SVGs as React components (like `import { ReactComponent as Logo } from './logo.svg'`)
- ✅ SVG import options:
  - `titleProp: true`
  - `ref: true`
  - No optimization (svgo disabled)
  - Keep viewBox attribute
- ✅ Fallback: SVG as static file asset

### 5. Image & Asset Handling

- ✅ Support image formats: `.png`, `.jpg`, `.jpeg`, `.gif`, `.bmp`, `.avif`
- ✅ Inline small images as base64 (threshold: 10KB / 10,000 bytes)
- ✅ Output images to `media/` subdirectory with content hash
- ✅ Generic asset handling for other file types

### 6. Environment Variables

- ✅ Load `.env` files (`.env`, `.env.local`, `.env.production`, `.env.development`)
- ✅ Inject environment variables into JS code:
  - `NODE_ENV` → development/production
  - `PUBLIC_URL` → base URL path
  - All `REACT_APP_*` variables
- ✅ Replace `%PUBLIC_URL%` in HTML template
- ✅ Support `.env` variable expansion

### 7. HTML Processing

- ✅ Use `public/index.html` as template
- ✅ Inject JS and CSS bundles into HTML
- ✅ Interpolate `%PUBLIC_URL%` variables in HTML
- ✅ Minify HTML in production:
  - Remove comments
  - Collapse whitespace
  - Remove redundant attributes
  - Minify inline JS/CSS

---

## 🟡 IMPORTANT REQUIREMENTS (Should Have)

### 8. Build Modes

**Development mode** (`npm start`):
- ✅ Fast rebuilds
- ✅ Source maps (cheap-module-source-map equivalent)
- ✅ No minification
- ✅ CSS injection via style tags

**Production mode** (`npm build`):
- ✅ Full optimization
- ✅ Minification (JS, CSS, HTML)
- ✅ CSS extraction to files
- ✅ Source maps (optional, controlled by env var)

### 9. File Naming Patterns

- ✅ Production JS: `js/[name].[hash].js`
- ✅ Production chunks: `js/[name].[hash].chunk.js`
- ✅ Production CSS: `css/[name].[hash].css`
- ✅ Production CSS chunks: `css/[name].[hash].chunk.css`
- ✅ Images/Media: `media/[name].[hash].[ext]`
- ✅ Use 8-character hash (or similar)

### 10. Module Resolution

- ✅ Resolve extensions: `.mjs`, `.js`, `.mts`, `.ts`, `.jsx`, `.tsx`, `.json`
- ✅ Alias: `react-native` → `react-native-web`
- ✅ Resolve from `node_modules`

### 11. Asset Manifest

- ✅ Generate `asset-manifest.json` with:
  - Mapping of all assets to their hashed filenames
  - List of entrypoint files

### 12. Browser Support

- ✅ Use browserslist from `package.json` for CSS autoprefixing
- ✅ Target modern browsers (ES2015+)
- ✅ Safari 10+ compatibility for minification

---

## 🟢 NICE-TO-HAVE REQUIREMENTS (Optional)

### 13. TypeScript Support

- ⚠️ Transpile TypeScript (Vite does this natively)
- 🔵 Separate type checking (can run `tsc --noEmit` separately)

### 14. Linting

- 🔵 ESLint during build (optional - can run separately)
- 🔵 Lint only `src/` directory
- 🔵 Support extensions: `.js`, `.mjs`, `.jsx`, `.ts`, `.tsx`

### 15. Service Worker (If needed)

- ❌ Skip for now (only needed if `src/service-worker.js` exists)
- 🔵 Can add later with `vite-plugin-pwa` if required

### 16. Optimization

- 🔵 Tree shaking (Vite does this natively)
- 🔵 Dead code elimination (Vite does this natively)
- 🔵 Moment.js locale exclusion (handled by tree shaking in Vite)

### 17. Error Handling

- 🔵 Better error messages during build
- 🔵 Case-sensitive path warnings (less critical on Linux)

---

## ❌ NOT NEEDED (Vite Handles Natively or Not Required)

### 18. Features Vite Handles Automatically

- ❌ Hot Module Replacement (HMR) - You don't need this
- ❌ Module scope restriction - Not necessary
- ❌ Babel caching - Vite uses esbuild (much faster)
- ❌ Webpack-specific runtime inlining - Different approach
- ❌ Infrastructure logging configuration - Different system
- ❌ Case-sensitive paths plugin - Vite handles this

---

## 📋 CONFIGURATION FILES NEEDED

### 1. `vite.config.js` - Main configuration

```javascript
{
  base: '/static/compiled/',
  build: {
    outDir: '../djsrc/static/compiled/',
    assetsInlineLimit: 10000,
    assetsDir: 'media',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // CSS: css/[name].[hash].css
          // Images: media/[name].[hash].[ext]
        },
        chunkFileNames: 'js/[name].[hash].chunk.js',
        entryFileNames: 'js/[name].[hash].js'
      }
    },
    manifest: true,
    sourcemap: process.env.GENERATE_SOURCEMAP !== 'false'
  },
  plugins: [
    react(),
    svgr(),
    customHtmlMoverPlugin()
  ]
}
```

### 2. `postcss.config.cjs` - PostCSS configuration

```javascript
{
  plugins: [
    'postcss-flexbugs-fixes',
    ['postcss-preset-env', {
      autoprefixer: { flexbox: 'no-2009' },
      stage: 3
    }],
    'postcss-normalize'
  ]
}
```

### 3. `.env` support

```
- Load .env files in priority order:
  1. .env.production.local / .env.development.local
  2. .env.production / .env.development
  3. .env.local
  4. .env

- Variable naming: REACT_APP_* → VITE_*
  (or use custom plugin to support both)
```

### 4. `package.json` updates

```json
{
  "scripts": {
    "start": "vite build --mode development --watch",
    "build": "vite build --mode production"
  }
}
```

---

## 🔧 CUSTOM PLUGINS REQUIRED

### Plugin 1: HTML to Django Templates

**Purpose**: Move `index.html` from static to templates directory

**Implementation**:
```javascript
{
  name: 'move-html-to-django-templates',
  closeBundle() {
    const fs = require('fs-extra');
    fs.moveSync(
      '../djsrc/static/compiled/index.html',
      '../djsrc/templates/react/index.html',
      { overwrite: true }
    );
  }
}
```

### Plugin 2: SVGR Integration

**Package**: `vite-plugin-svgr`

**Configuration**:
```javascript
svgr({
  svgrOptions: {
    titleProp: true,
    ref: true,
    svgo: false,
    svgoConfig: {
      plugins: [{ removeViewBox: false }]
    }
  }
})
```

### Plugin 3: Environment Variable Interpolation (Optional)

**Purpose**: Replace `%PUBLIC_URL%` in HTML

**Options**:
- Use Vite's built-in HTML transform
- Custom plugin if needed for full webpack compatibility

---

## ⚠️ BREAKING CHANGES TO ADDRESS

### Code Changes Required

#### 1. Environment Variables

**Webpack (Old)**:
```javascript
const publicUrl = process.env.PUBLIC_URL;
const apiKey = process.env.REACT_APP_API_KEY;
const nodeEnv = process.env.NODE_ENV;
```

**Vite (New)**:
```javascript
const publicUrl = import.meta.env.BASE_URL;
const apiKey = import.meta.env.VITE_API_KEY;  // Renamed
const nodeEnv = import.meta.env.MODE;
```

**Migration Strategy**:
- Option A: Update all code to use `import.meta.env`
- Option B: Create custom plugin to support `process.env` (not recommended)

#### 2. Environment Variable Names

All environment variables must be renamed:
- `REACT_APP_API_KEY` → `VITE_API_KEY`
- `REACT_APP_*` → `VITE_*`

Update in:
- `.env` files
- `.env.local` files
- `.env.production` files
- `.env.development` files
- Any documentation

#### 3. SVG Imports (If applicable)

**Webpack (Old)**:
```javascript
import { ReactComponent as Logo } from './logo.svg';
```

**Vite with vite-plugin-svgr (New)**:
```javascript
// May stay the same or need:
import Logo from './logo.svg?react';
```

**Action**: Test SVG imports after migration and update if needed.

#### 4. Public URL in HTML

**Both should work the same**:
```html
<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
```

Vite may require custom configuration to support `%PUBLIC_URL%` syntax.

---

## 📊 SUMMARY BREAKDOWN

| Category | Count | Status |
|----------|-------|--------|
| **Critical (Must Have)** | 45 features | Required for basic functionality |
| **Important (Should Have)** | 28 features | Needed for full feature parity |
| **Nice-to-Have** | 12 features | Optional/can be added later |
| **Not Needed** | 25 features | Vite handles or not applicable |
| **TOTAL** | 110 features | From webpack analysis |

---

## 🎯 IMPLEMENTATION PHASES

### Phase 1: Core Setup (Critical)
1. Install Vite and core plugins
2. Create `vite.config.js` with basic settings
3. Create custom HTML mover plugin
4. Configure output paths and structure
5. Test basic build

### Phase 2: Asset Processing (Critical)
1. Configure SVG handling (vite-plugin-svgr)
2. Configure image processing
3. Setup CSS/SCSS processing
4. Create `postcss.config.cjs`
5. Test all asset types

### Phase 3: Environment & Variables (Critical)
1. Configure environment variable support
2. Document REACT_APP_* → VITE_* migration
3. Test environment variable injection
4. Update HTML variable interpolation

### Phase 4: Build Optimization (Important)
1. Configure file naming patterns
2. Setup asset manifest generation
3. Configure source maps
4. Test development and production builds
5. Verify output matches webpack structure

### Phase 5: Optional Features (Nice-to-Have)
1. Add ESLint plugin (optional)
2. Add type checking script
3. Add service worker support (if needed)
4. Performance testing and optimization

---

## 📦 REQUIRED PACKAGES

### Core Vite Packages
```bash
npm install --save-dev vite @vitejs/plugin-react
```

### SVG Support
```bash
npm install --save-dev vite-plugin-svgr
```

### CSS/PostCSS
```bash
npm install --save-dev sass
npm install --save-dev postcss
npm install --save-dev postcss-flexbugs-fixes
npm install --save-dev postcss-preset-env
npm install --save-dev postcss-normalize
```

### Utilities
```bash
npm install --save-dev fs-extra
```

### Optional
```bash
# ESLint plugin (optional)
npm install --save-dev vite-plugin-eslint

# PWA/Service Worker (optional)
npm install --save-dev vite-plugin-pwa
```

---

## 📝 NOTES

### Differences from Webpack

1. **Faster builds**: Vite uses esbuild instead of Babel for transpilation
2. **Different dev server**: Vite has its own dev server (not needed for this project)
3. **Native ESM**: Vite uses ES modules natively
4. **Simpler config**: Less configuration needed for common tasks
5. **Better DX**: Faster feedback during development


---

## 🔗 REFERENCES

- [Vite Documentation](https://vitejs.dev/)
- [Vite Plugin React](https://github.com/vitejs/vite-plugin-react)
- [vite-plugin-svgr](https://github.com/pd4d10/vite-plugin-svgr)
- [PostCSS Plugins](https://github.com/postcss/postcss/blob/main/docs/plugins.md)

---