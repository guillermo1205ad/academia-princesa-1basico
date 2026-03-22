# Aventura de Aprendizaje - 1° Básico

Aplicación web estática en React + Vite para estudiar temario de 1° básico con enfoque infantil, actividades cortas y progreso guardado en `localStorage`.

## Stack

- React (Vite)
- JavaScript (sin TypeScript)
- HTML + CSS
- Sin backend ni APIs externas

## Características

- Pantalla de inicio amigable.
- Tema visual princesa (colores suaves, diseño infantil elegante y motivador).
- Menú principal por asignatura.
- Asignaturas: Matemática, Ciencias, Lenguaje, Historia e Inglés.
- Secciones por asignatura: Aprender, Practicar, Jugar y Repaso final.
- 12 actividades por asignatura (60 en total), alineadas al temario.
- Actividades autocorregibles con feedback inmediato.
- Progreso por asignatura + progreso global con estrellas.
- Guardado local con `localStorage`.
- Opción para reiniciar progreso.
- Diseño responsive (celular, tablet, escritorio).
- Soporte opcional de pronunciación (`speechSynthesis`) en Inglés.

## Estructura de carpetas

```text
.
├── .github/workflows/deploy.yml
├── index.html
├── package.json
├── vite.config.js
└── src
    ├── App.jsx
    ├── main.jsx
    ├── styles.css
    ├── components
    │   ├── ActivityRenderer.jsx
    │   ├── HomeScreen.jsx
    │   ├── MainMenu.jsx
    │   └── SubjectScreen.jsx
    ├── data
    │   └── subjectsData.js
    └── utils
        └── storage.js
```

## Ejecutar localmente

```bash
npm install
npm run dev
```

Luego abre la URL que entrega Vite (normalmente `http://localhost:5173`).

## Build de producción

```bash
npm run build
npm run preview
```

## Despliegue en GitHub Pages

El proyecto ya incluye workflow en `.github/workflows/deploy.yml`.

Pasos:

1. Sube el proyecto a un repositorio en GitHub (rama `main`).
2. En GitHub ve a `Settings > Pages`.
3. En `Build and deployment`, selecciona `Source: GitHub Actions`.
4. Haz push a `main` y espera a que termine el workflow `Deploy to GitHub Pages`.
5. GitHub mostrará la URL pública en la sección de Pages.

## Nota de rutas para GitHub Pages

`vite.config.js` está configurado con `base: "./"` para evitar problemas de rutas al servir la app como sitio estático en subcarpetas.
