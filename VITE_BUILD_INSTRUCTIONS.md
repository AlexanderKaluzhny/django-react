# Vite Build Instructions

This document provides detailed instructions for building the frontend using Vite.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Quick Start

```bash
cd front-end
npm run build
```

That's it! The build output will be placed in the Django directories.

---

## Installation (Only Needed Once)

If you're setting up the project for the first time or on a new machine:

### 1. Navigate to the frontend directory

```bash
cd /home/user/django-react/front-end
```

### 2. Install dependencies

```bash
npm install
```

This installs all required packages from `package.json`, including:
- `vite@7.2.2` - Core build tool
- `@vitejs/plugin-react@5.1.1` - React plugin
- `vite-plugin-svgr@4.3.0` - SVG as React components
- `sass@1.83.0` - SCSS support
- PostCSS plugins (flexbugs-fixes, preset-env, normalize)

---

## Build Commands

### Production Build (Optimized & Minified)

**Command:**
```bash
npm run build
```

**What it does:**
- Builds the frontend in **production mode**
- Minifies JavaScript (~85% size reduction)
- Extracts and minifies CSS
- Generates source maps for debugging
- Optimizes assets (images, fonts, etc.)
- Completes in **~2-3 seconds**

**Output:**
```
vite v7.2.2 building client environment for production...
✓ 32 modules transformed.
../djsrc/static/compiled/js/index.[hash].js    146.66 kB │ gzip: 47.87 kB
../djsrc/static/compiled/css/index.[hash].css    0.73 kB │ gzip:  0.48 kB
✓ built in 2.55s
✓ Moved index.html to Django templates directory
```

**Generated files:**
- Static assets → `djsrc/static/compiled/`
- HTML template → `djsrc/templates/react/index.html`

---

### Development Build (Unminified, Detailed Debugging)

**Command:**
```bash
npm start
```

**What it does:**
- Builds the frontend in **development mode**
- Keeps code unminified for easier debugging
- Generates detailed source maps
- Faster to debug, slower to load
- Completes in **~3-4 seconds**

**Output:**
```
vite v7.2.2 building client environment for development...
✓ 32 modules transformed.
../djsrc/static/compiled/js/index.[hash].js    1,005.12 kB │ gzip: 166.02 kB
✓ built in 3.53s
✓ Moved index.html to Django templates directory
```

---

## Build Output Structure

After running either build command, files are generated in the following structure:

```
djsrc/
├── static/compiled/                # Static assets served by Django
│   ├── .vite/
│   │   └── manifest.json          # Asset manifest for Django
│   ├── js/
│   │   ├── index.[hash].js        # JavaScript bundle
│   │   └── index.[hash].js.map    # Source map
│   ├── css/
│   │   └── index.[hash].css       # Extracted CSS
│   ├── media/                      # Images and other assets (if any)
│   ├── favicon.ico                 # Copied from public/
│   ├── logo192.png                 # Copied from public/
│   ├── logo512.png                 # Copied from public/
│   ├── manifest.json               # Copied from public/
│   └── robots.txt                  # Copied from public/
└── templates/react/                # Django templates
    └── index.html                  # Generated HTML with injected scripts
```

---

## Verify Build Output

After building, you can verify the output:

### Check static assets
```bash
ls -lh djsrc/static/compiled/js/
ls -lh djsrc/static/compiled/css/
```

### Check Django template
```bash
cat djsrc/templates/react/index.html
```

### Verify file sizes
```bash
du -sh djsrc/static/compiled/js/*
du -sh djsrc/static/compiled/css/*
```

---

## Build Configuration

All build settings are configured in `front-end/vite.config.js`:

| Setting | Value | Description |
|---------|-------|-------------|
| **Base path** | `/static/compiled/` | Public URL path for assets |
| **Output directory** | `../djsrc/static/compiled/` | Where static assets go |
| **HTML output** | `../djsrc/templates/react/index.html` | Django template location |
| **File naming** | `js/[name].[hash].js` | Cache-busting with content hash |
| **Asset inline limit** | 10KB | Files smaller than 10KB are inlined |
| **Source maps** | Enabled | Controlled by `GENERATE_SOURCEMAP` env var |
| **Target** | ES2015 | Browser compatibility target |

---

## Environment Variables

### Disable Source Maps

To build without source maps (smaller output):

```bash
GENERATE_SOURCEMAP=false npm run build
```

### Custom Environment Variables

If you need to use environment variables in your React code:

1. Create a `.env` file in `front-end/`:
```bash
VITE_API_URL=https://api.example.com
VITE_API_KEY=your-api-key
```

2. Use in your code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;
```

**Important:** All environment variables must start with `VITE_` prefix to be exposed to your code.

---

## Common Tasks

### Clean Build (Remove Old Files First)

```bash
# Remove old build files
rm -rf djsrc/static/compiled/*
rm -rf djsrc/templates/react/*

# Run fresh build
cd front-end
npm run build
```

### Update Dependencies

```bash
cd front-end
npm update
```

### Check for Outdated Packages

```bash
cd front-end
npm outdated
```

---

## Performance Comparison

### Build Times

| Mode | Time | Description |
|------|------|-------------|
| **Production** | ~2.5s | Optimized, minified |
| **Development** | ~3.5s | Unminified, detailed maps |

### Bundle Sizes

| Asset | Development | Production | Compression |
|-------|-------------|------------|-------------|
| **JavaScript** | 1,005 KB | 146.66 KB | **85% smaller** |
| **JavaScript (gzip)** | 166 KB | 47.87 KB | **71% smaller** |
| **CSS** | 0.93 KB | 0.73 KB | Optimized |
| **Source Maps** | 1,677 KB | 353 KB | More efficient |

---

## Troubleshooting

### "Command not found: npm"

Install Node.js first:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install nodejs npm

# macOS with Homebrew
brew install node

# Verify installation
node --version
npm --version
```

### Build Errors

If you encounter module or dependency errors:

```bash
cd front-end

# Remove existing installations
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# Try building again
npm run build
```

### "Cannot find module" Errors

Make sure you're in the correct directory:
```bash
# You should be in the front-end directory
pwd
# Output should be: /home/user/django-react/front-end

# If not, navigate there
cd /home/user/django-react/front-end
```

### Output Files Not Generated

Check that the output directories exist:
```bash
# Create directories if they don't exist
mkdir -p ../djsrc/static/compiled
mkdir -p ../djsrc/templates/react

# Run build again
npm run build
```

### Permission Errors

If you get permission denied errors:
```bash
# Check current permissions
ls -la ../djsrc/static/
ls -la ../djsrc/templates/

# Fix permissions if needed (adjust as necessary)
chmod -R 755 ../djsrc/static/
chmod -R 755 ../djsrc/templates/
```

---

## Advanced Usage

### Build with Different Modes

Vite supports custom modes. The current setup uses:
- `development` - Unminified, detailed debugging
- `production` - Minified, optimized

You can create custom modes if needed by adding `.env.{mode}` files.

### Analyzing Bundle Size

To see what's in your bundle:

```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.js and rebuild
# The analyzer will generate a visual report
```

### Customize Build Output

Edit `front-end/vite.config.js` to customize:
- Output file names
- Asset handling
- Minification settings
- Source map format
- And more

Refer to [Vite documentation](https://vitejs.dev/config/) for all options.

---

## Integration with Django

### Serving the Built Files

The Django view that serves the React app is in `djsrc/app/views.py`:

```python
class IndexView(TemplateView):
    template_name = "react/index.html"
```

### URL Configuration

The route is defined in `djsrc/config/urls.py`:

```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('react-index/', IndexView.as_view())
]
```

### Static Files Configuration

Make sure your Django settings (`djsrc/config/settings.py`) include:

```python
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]
```

---

## Build Process Workflow

### Development Workflow

1. Make changes to React code in `front-end/src/`
2. Run development build: `npm start`
3. Django serves the unminified code
4. Debug with browser dev tools (source maps available)
5. Iterate quickly

### Production Workflow

1. Complete development and testing
2. Run production build: `npm run build`
3. Optimized assets are generated
4. Django serves the minified code
5. Deploy to production

---

## Additional Resources

- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/
- **PostCSS**: https://postcss.org/
- **SASS**: https://sass-lang.com/

---

## Summary

**Quick reference:**

```bash
# First time setup
cd front-end
npm install

# Production build (use this for deployment)
npm run build

# Development build (use this for debugging)
npm start

# Verify output
ls -la ../djsrc/static/compiled/
cat ../djsrc/templates/react/index.html
```

**That's all you need to know to build the frontend!** 🚀
