# DuneTube Frontend

A Vite + React + TypeScript single-page application for the DuneTube catalog.

## Features
- Tailwind CSS styling with a responsive layout.
- Multi-language support (English, فارسی، العربية) using `react-i18next`.
- Catalog page that fetches live course data from `/api/courses/`.
- Home page with API health probe and quick navigation to the catalog.

## Development
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```

The build step outputs static assets to the `dist/` directory that can be served by any static hosting solution or proxied behind the backend API.
