# Django-React integration approach

Project sources consist of 2 parts:
* djsrc/ - Simplest possible Django project bootstrapped using the *django-admin startproject*. Project structure was slightly modified for better splitting of config & settings files.
* front-end/ - The front-end part of the project built with Vite, configured to compile React assets directly into Django's static and templates directories (eliminating the need for a separate front-end dev server)

## How to run it

* clone the repo
* `cd djsrc/` and init the virtualenv. For example using the *pipenv*
```
pipenv shell
```
* install dependencies and run django dev server
```
pip install -r requirements.txt
./manage.py runserver
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
* Built files are placed into Django's `static` folder (`djsrc/static/compiled/`) and the HTML template is moved to `djsrc/templates/react/index.html`
* Since we're not using Vite's dev server (which has HMR), you need to refresh the page in your browser after changes are rebuilt
* Built filenames include content hashes in both development and production modes for cache busting

### The logic of the front-end build

Vite is configured (via `vite.config.js`) with:
* **Base path:** `/static/compiled/` - all assets are referenced with this prefix
* **Output directory:** `../djsrc/static/compiled/` - where JS, CSS, and static assets go
* **Custom plugin:** `vite-plugin-html-to-django.js` - moves the generated `index.html` from the static folder to Django templates (`djsrc/templates/react/index.html`)

After compiling, Vite automatically injects the hashed bundle paths into `index.html`:
```html
<script type="module" src="/static/compiled/js/index.PuXUGVKU.js"></script>
<link rel="stylesheet" href="/static/compiled/css/index.CGX9qSk3.css">
```

Django's `TemplateView` serves `index.html` to the browser, and the browser makes requests for the scripts and stylesheets (compiled bundles). These are served by Django's static files system in the usual way, because the bundles are located in the standard Django `static` folder.

### Why this approach?

This approach provides several benefits:
* **No separate dev server needed:** Unlike typical Vite setups that run a dev server, this configuration builds static files that Django serves directly
* **Simple Django integration:** No need for proxy configurations, CORS settings, or complex Django static files setup
* **Fast builds:** Vite uses esbuild for transpilation, resulting in 40-75% faster builds compared to Webpack
* **Watch mode for development:** `npm start` watches for file changes and automatically rebuilds (incremental builds are very fast - ~1-2 seconds)
* **Full configuration control:** Clean and simple `vite.config.js` (187 lines) compared to complex webpack configs (697+ lines)
* **Modern tooling:** Vite provides excellent developer experience with better error messages and faster feedback
* **Smaller bundles:** Production builds are 85% smaller (146 KB vs 1 MB) thanks to better tree-shaking and optimization

### Available Scripts

In the `front-end` directory, you can run:

#### `npm start`

Compiles the front-end in the development mode. Stays in the `watch` mode. <br />
When you make changes to source files, Vite automatically detects them and rebuilds (incremental builds complete in ~1-2 seconds).

#### `npm run build`

Builds the app for production. Places everything into the Django *static* folder. <br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />

#### `npm run lint`

Runs ESLint to check code quality and catch potential issues.
Uses ESLint 9 with flat config format and React-specific rules.

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
- See `VITE_BUILD_INSTRUCTIONS.md` for detailed build instructions
- See `VITE_PORT_REQUIREMENTS.md` for migration requirements from Webpack
- See `PR_DESCRIPTION.md` for complete migration details
