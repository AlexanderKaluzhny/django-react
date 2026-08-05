

# Enfoque de integración Django-React

Las fuentes del proyecto consisten en 2 partes:
* djsrc/ - Proyecto Django lo más simple posible, inicializado mediante *django-admin startproject*. La estructura del proyecto se modificó ligeramente para una mejor separación de los archivos de configuración y settings.
* front-end/ - La parte front-end del proyecto construida con Vite, configurada para compilar los activos de React directamente en los directorios static y templates de Django (eliminando la necesidad de un servidor de desarrollo front-end separado)

## Cómo ejecutarlo

* el proyecto utiliza UV, consulte [UV con Django](https://blog.pecar.me/uv-with-django#using-uv-to-create-a-new-django-project) para la guía sobre el uso de UV con Django. 
* `cd djsrc/` e inicialice el entorno virtual. 
```
uv sync
```
```
uv run manage.py runserver
```
Luego abra una terminal separada:
```
cd ../front-end
npm install
npm start
```

## Explicación del front-end

El front-end está construido con Vite, una herramienta de compilación moderna y rápida para aplicaciones React.
* Vite está configurado con una configuración de compilación personalizada que elimina la necesidad de ejecutar un servidor de desarrollo front-end separado (como el servidor de desarrollo incorporado de Vite)
* Al ejecutar `npm start`, Vite compila la aplicación React en modo de desarrollo con el modo watch habilitado: reconstruye automáticamente cuando se realizan cambios en los archivos de origen
* Los archivos compilados se colocan en la carpeta `static` de Django (`djsrc/static/compiled/`) y la plantilla HTML se mueve a `djsrc/templates/react/index.html`
* Dado que no estamos usando el servidor de desarrollo de Vite (que tiene HMR), debe actualizar la página en su navegador después de que los cambios se reconstruyan
* Los nombres de los archivos compilados incluyen hashes de contenido tanto en modo de desarrollo como en producción para invalidar la caché

### La lógica de la compilación del front-end

Vite está configurado (vía `vite.config.js`) con:
* **Ruta base:** `/static/compiled/` - todos los activos se referencian con este prefijo
* **Directorio de salida:** `../djsrc/static/compiled/` - donde van los archivos JS, CSS y activos estáticos
* **Plugin personalizado:** `vite-plugin-html-to-django.js` - mueve el `index.html` generado desde la carpeta estática a las plantillas de Django (`djsrc/templates/react/index.html`)

Después de compilar, Vite inyecta automáticamente las rutas de los bundles con hash en `index.html`:
```html
<script type="module" src="/static/compiled/js/index.PuXUGVKU.js"></script>
<link rel="stylesheet" href="/static/compiled/css/index.CGX9qSk3.css">
```

La `TemplateView` de Django sirve `index.html` al navegador, y el navegador realiza solicitudes para los scripts y hojas de estilo (bundles compilados). Estos se sirven mediante el sistema de archivos estáticos de Django de la manera habitual, ya que los bundles se encuentran en la carpeta `static` estándar de Django.

### ¿Por qué este enfoque?

Este enfoque ofrece varios beneficios:
* **No se necesita un servidor de desarrollo separado:** A diferencia de las configuraciones típicas de Vite que ejecutan un servidor de desarrollo, esta configuración compila archivos estáticos que Django sirve directamente
* **Integración simple con Django:** No se necesita configuración adicional de Django ni etiquetas de plantilla

### Scripts disponibles

En el directorio `front-end`, puede ejecutar:

#### `npm start`

Compila el front-end en modo de desarrollo. Permanece en modo `watch`. <br />
Cuando realiza cambios en los archivos de origen, Vite los detecta automáticamente y reconstruye (las compilaciones incrementales se completan en ~1-2 segundos).

#### `npm run build`

Compila la aplicación para producción. Coloca todo en la carpeta *static* de Django. <br />
La compilación se minifica y los nombres de archivo incluyen los hashes.<br />

#### `npm run lint`

Ejecuta ESLint para verificar la calidad del código y detectar problemas potenciales.

## Más información

### Documentación de Vite
- [Documentación oficial de Vite](https://vitejs.dev/)
- [Configuración de compilación de Vite](https://vitejs.dev/config/build-options.html)
- [API de plugins de Vite](https://vitejs.dev/guide/api-plugin.html)

### Documentación de React
- [Documentación oficial de React](https://react.dev/)
- [Características de React 18](https://react.dev/blog/2022/03/29/react-v18)

### Archivos estáticos de Django
- [Gestión de archivos estáticos en Django](https://docs.djangoproject.com/en/stable/howto/static-files/)
- [Vistas de plantillas de Django](https://docs.djangoproject.com/en/stable/ref/class-based-views/base/#templateview)

### Documentación específica del proyecto
- Consulte `VITE_BUILD_INSTRUCTIONS.md` para obtener instrucciones detalladas de compilación
- Consulte `VITE_PORT_REQUIREMENTS.md` para conocer los requisitos de migración desde Webpack
