# Django-React integration approach

Project sources consist of 2 parts: 
* djsrc/ - Simplest possible Django project bootstrapped using the *django-admin startproject*. Project structure was slightly modified for better splitting of config & settings files. 
* front-end/ - The front-end part of the project based on the *ejected* Create React App, with the modified configuration scripts (eliminated the need for running a separate front-end server (Webpack Dev Server), and more)

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

  The front-end part of the project based on the *ejected* [Create React App](https://github.com/facebook/create-react-app). 
* The Create React App config scripts were modified  (heavily?) to (1) eliminate the need for running of a separate front-end server (Webpack Dev Server) and (2) - place built files into the Django `static` folder  <br /> 
* Now on runnning of `npm start`, the development mode front-end assets are compiled and placed into the django *static* folder from where they are server by Django dev server. <br />
* With removing of front-end server the page would not reload if you make edits, so you need to refresh the page after changes.
* Built filenames include the hashes in development mode too. 

### The logic of the front-end build 

Front-end knows the path to `index.html` (`djsrc/templates/react/`) and the path to bundle output folder (`djsrc/static/compiled/`) where it places the compiled bundle. <br />
After compiling, the front-end injects the bundle paths into the `index.html`:
```
<script src="/static/compiled/js/bundle.80ad2907.js"></script>
<script src="/static/compiled/js/0.chunk.2771b122.js"></script>
<script src="/static/compiled/js/main.chunk.d86eca72.js"></script>

```
Django view serves `index.html` to the browser and 
the browser makes requests for the scripts (compiled bundles). <br />
Then these scripts are served by back-end (dev/production) server in a usual way as every other static files are served, because the bundles are located in the usual Django `static` files folder.
<br />
<br />
As you see, with that approach we need to deal with front-end configuration scripts *manually* in contrast to approach of using Create React App when it is not ejected. <br />

But the current approach: 
* Eliminates the need in running of a separate front-end dev server which assumed having of additional logic that redirects requests from django dev server to front-end dev server (in development mode)
* Eliminates the need in making changes to Django static files settings to serve front-end compiled bundles from CRA specific folders
* Eliminates the need for hacking the CRA config scripts with Craco. 
* Opens up the way to changing the configuration of your front-end app, having the solid configuration files provided out of the box (Great thank you to the CRA team)


### Available Scripts

In the `front-end` directory, you can run:

#### `npm start`

Compiles the front-end in the development mode. Stays in the `watch` mode. <br />

#### `npm run build`

Builds the app for production. Places everything into the Django *static* folder. <br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />

#### `npm test` (Not checked)

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

Managing static files (e.g. images, JavaScript, CSS) in Django [Django documentation](https://docs.djangoproject.com/en/3.0/howto/static-files/)

Webpack configuration docs [Webpack documentation](https://webpack.js.org/configuration/mode/#mode-development)

Sources of Create React App react-dev-utils [react-dev-utils](https://github.com/facebook/create-react-app/blob/master/packages/react-dev-utils/getPublicUrlOrPath.js)

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment of Create React App

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
