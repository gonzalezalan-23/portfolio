# Alan González — Portfolio

Portfolio público con proyectos, casos de estudio y CV descargable. Está preparado para publicarse en GitHub Pages sin dependencias ni pasos de compilación.

## Estructura

```text
├── index.html                  # Inicio
├── proyectos.html              # Grilla de proyectos
├── proyecto.html               # Ficha dinámica (?id=slug)
├── 404.html                    # Página de error
├── assets/
│   ├── css/                    # Estilos
│   ├── js/                     # Lógica del sitio y modo secreto
│   ├── img/proyectos/          # Capturas webp por proyecto
│   ├── img/icons/              # Iconos SVG
│   └── cv/                     # Fuente HTML y PDF del CV
├── data/proyectos.json         # Fuente única de proyectos
├── demos/                      # Demos locales de hardware
├── docs/                       # Documentación del sitio
├── scripts/validar-proyectos.mjs
└── .github/workflows/validar.yml
```

## Desarrollo local

El sitio es estático. Serví la carpeta con Python:

```bash
python -m http.server 8080
```

Abrí `http://localhost:8080`. No uses `file://`: el cargador de `data/proyectos.json` necesita HTTP.

Antes de publicar, validá los datos:

```bash
node scripts/validar-proyectos.mjs
```

## Publicar en GitHub Pages

1. En el repositorio: **Settings → Pages**.
2. En **Build and deployment → Source**, elegir **GitHub Actions**.
3. Publicar en `main`. El workflow de validación corre en cada push; el sitio se sirve desde la raíz.

La URL final depende del nombre del repositorio. Cuando esté activa, agregarla al CV, al README de perfil y a los enlaces de contacto.

## Modo secreto

El sitio arranca en modo cliente. El footer tiene un disparador discreto que activa el modo A.L.A.N./JARVIS: guarda la preferencia en `localStorage` (`alan:mode`), cambia el tema a esmeralda y muestra la barra de protocolo. Es una capa visual personal, no un contenido comercial.

## Seguridad

No hay archivos `.env`, tokens ni credenciales en este repositorio. Los originales de las capturas y los archivos personales que no se usan en el sitio quedaron fuera de `D:\Portfolio`. Antes de futuros commits, evitar subir claves, PDFs con datos personales o capturas sin revisar.

## Contacto

- Email: gonzalez.alan.dev@gmail.com
- GitHub: https://github.com/gonzalezalan-23

