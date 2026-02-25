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
---

## Build Commands

### Production Build (Optimized & Minified)

**Command:**
```bash
npm run build
```

**Generated files:**
- Static assets → `djsrc/static/compiled/`
- HTML templates → `djsrc/templates/react/` (one per entry point)

---

### Development Build (Unminified, Detailed Debugging)

**Command:**
```bash
npm start
```

**What it does:**
- Builds the frontend in **development mode**
- Keeps code unminified for easier debugging
- Generates hidden source maps (`.map` files on disk, no `sourceMappingURL` comments in output)
- Faster to debug, slower to load

---

## Build Output Structure

After running either build command, files are generated in the following structure:

```
djsrc/
├── static/compiled/                # Static assets served by Django
│   ├── .vite/
│   │   └── manifest.json          # Asset manifest (used by inject plugin)
│   ├── js/
│   │   ├── mainApp.[hash].js      # Main app entry bundle
│   │   ├── demoMicroApp.[hash].js # Demo micro-app entry bundle
│   │   ├── *.[hash].chunk.js      # Shared chunks
│   │   └── *.[hash].js.map        # Source maps (hidden — no sourceMappingURL in JS)
│   ├── css/
│   │   └── mainApp.[hash].css     # Extracted CSS (per entry)
│   ├── media/                      # Images and other assets (if any)
│   ├── favicon.ico                 # Copied from public/
│   ├── logo192.png                 # Copied from public/
│   ├── logo512.png                 # Copied from public/
│   ├── manifest.json               # Copied from public/
│   └── robots.txt                  # Copied from public/
└── templates/react/                # Django templates (processed by inject plugin)
    ├── index.html                  # Main app — with injected <script>/<link> tags
    └── demo.html                   # Demo micro-app — Django {{ page_title }} preserved
```

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

## Build Configuration

All build settings are configured in `front-end/vite.config.js`:

| Setting | Value | Description |
|---------|-------|-------------|
| **Base path** | `/static/compiled/` | Public URL path for assets |
| **Output directory** | `../djsrc/static/compiled/` | Where static assets go |
| **Template output** | `../djsrc/templates/react/` | Django templates (one per entry) |
| **Entry points** | JS-only rollup inputs | `mainApp` + `demoMicroApp` |
| **File naming** | `js/[name].[hash].js` | Cache-busting with content hash |
| **Asset inline limit** | 10KB | Files smaller than 10KB are inlined |
| **Source maps** | `'hidden'` | `.map` files generated, no `sourceMappingURL` in output |
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

### Customize Build Output

Edit `front-end/vite.config.js` to customize:
- Output file names
- Asset handling
- Minification settings
- Source map format
- And more

Refer to [Vite documentation](https://vitejs.dev/config/) for all options.

---
