# Django-React integration approach

Project sources consist of 2 parts:
* djsrc/ - Simplest possible Django project bootstrapped using the *django-admin startproject*. Project structure was slightly modified for better splitting of config & settings files.
* front-end/ - The front-end part of the project built with Vite, configured to compile React assets directly into Django's static and templates directories (eliminating the need for a separate front-end dev server)

## How to run it

* the project is using UV, please refer to [UV with Django](https://blog.pecar.me/uv-with-django#using-uv-to-create-a-new-django-project) for the guide on using UV with Django.
* `cd djsrc/` and init the virtualenv.
```
uv sync
```
```
uv run manage.py runserver
```
Then open a separate terminal:
```
cd ../front-end
npm install
npm start
```

## Front-end explanation

The front-end is built with Vite, a modern and fast build tool for React applications.
* Vite is configured with a custom build setup that eliminates the need for running a separate front-end dev server (like Vite's built-in dev server)
* On running `npm start`, Vite compiles the React application in development mode with watch mode enabled - it automatically rebuilds when you make changes to source files
* Built JS/CSS files are placed into Django's `static` folder (`djsrc/static/compiled/`). A custom post-build plugin reads the Vite manifest, injects hashed `<script>` and `<link>` tags into the HTML templates, and writes them to `djsrc/templates/react/`
* Since we're not using Vite's dev server (which has HMR), you need to refresh the page in your browser after changes are rebuilt
* Built filenames include content hashes in both development and production modes for cache busting

### Multi-entry architecture

The project demonstrates a multi-entry-point architecture where each page has its own:
* **JS entry point** — defined in `vite.config.js` under `rollupOptions.input`
* **HTML template** — stored in `front-end/html-templates/`
* **Django view** — serving the processed template

Currently there are 2 entries:
* `mainApp` — the main React app (`src/index.jsx` → `html-templates/index.html`)
* `demoMicroApp` — a demo micro-app (`src/micro-apps/demo/index.js` → `html-templates/demo.html`)

HTML templates can contain Django template syntax (`{{ variable }}`, `{% tag %}`) — it passes through untouched because Vite never parses the HTML. The build uses JS-only rollup inputs, and the custom plugin handles template injection separately.

### The logic of the front-end build

Vite is configured (via `vite.config.js`) with:
* **Base path:** `/static/compiled/` - all assets are referenced with this prefix
* **Output directory:** `../djsrc/static/compiled/` - where JS, CSS, and static assets go
* **JS-only rollup inputs:** Entry points are JS files, not HTML — this avoids Vite's HTML parser which would break on Django template syntax
* **Custom plugin:** `vite-plugin-inject-django.js` — after each build, reads `.vite/manifest.json`, collects all JS/CSS assets (including from shared chunks), injects `<script>` and `<link>` tags into the source HTML templates from `html-templates/`, replaces `%PUBLIC_URL%`, and writes the processed templates to `djsrc/templates/react/`

Example output in a processed template:
```html
<link rel="stylesheet" href="/static/compiled/css/mainApp.B1O4We7H.css">
...
<script type="module" src="/static/compiled/js/mainApp.ZwxX0X51.js"></script>
```

Django's `TemplateView` serves the processed HTML to the browser, and the browser makes requests for the scripts and stylesheets (compiled bundles). These are served by Django's static files system in the usual way, because the bundles are located in the standard Django `static` folder.

### Why this approach?

This approach provides several benefits:
* **No separate dev server needed:** Unlike typical Vite setups that run a dev server, this configuration builds static files that Django serves directly
* **Simple Django integration:** No need for additional Django configuration and template tags
* **Django template compatibility:** HTML templates with `{{ }}` and `{% %}` syntax work without issues since Vite never parses the HTML
* **Multi-entry support:** Each page/micro-app gets its own entry point and only loads the JS/CSS it needs

### Available Scripts

In the `front-end` directory, you can run:

#### `npm start`

Compiles the front-end in the development mode. Stays in the `watch` mode. <br />
When you make changes to source files, Vite automatically detects them and rebuilds (incremental builds complete in ~1-2 seconds).

#### `npm run build`

Builds the app for production. Places everything into the Django *static* folder. <br />
The build is minified and the filenames include the hashes.<br />

#### `npm run lint`

Runs ESLint to check code quality and catch potential issues.

## Learn More

### Vite Documentation
- [Vite Official Documentation](https://vitejs.dev/)
- [Vite Build Configuration](https://vitejs.dev/config/build-options.html)
- [Vite Plugin API](https://vitejs.dev/guide/api-plugin.html)

### React Documentation
- [React Official Documentation](https://react.dev/)
- [React 18 Features](https://react.dev/blog/2022/03/29/react-v18)

### Django Static Files
- [Managing static files in Django](https://docs.djangoproject.com/en/stable/howto/static-files/)
- [Django Template Views](https://docs.djangoproject.com/en/stable/ref/class-based-views/base/#templateview)

### Project-Specific Documentation
- See `docs/VITE_BUILD_INSTRUCTIONS.md` for detailed build instructions
- See `docs/VITE_PORT_REQUIREMENTS.md` for migration requirements from Webpack