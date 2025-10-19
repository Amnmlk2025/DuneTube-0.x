# DuneTube Frontend

## Pages
- **Home**: marketing hero with API health check button and quick link to the catalog.
- **Catalog**: fetches `/api/courses/` and renders a responsive grid of course cards with pricing, language, and tags.

## Internationalization
- Implemented with `react-i18next`.
- Supported languages: English (`en`), Persian (`fa`), Arabic (`ar`).
- Language preference is persisted in `localStorage` and updates the document direction (`ltr`/`rtl`).

## Styling
- Tailwind CSS powers the utility-first design.
- Custom brand colors and typography defined in `tailwind.config.js`.

## Commands
```bash
npm install
npm run dev    # start development server
npm run build  # produce optimized production bundle
```
