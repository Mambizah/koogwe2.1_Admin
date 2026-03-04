# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Deploy sur Render

Ce repo est prêt pour Render via le fichier `render.yaml` à la racine du projet.

### Option 1 — Blueprint (recommandé)

1. Push le projet sur GitHub.
2. Sur Render: **New +** → **Blueprint**.
3. Sélectionne le repository.
4. Render détecte `render.yaml` et crée le service automatiquement.

### Option 2 — Static Site manuel

- Type: **Static Site**
- Root Directory: `admin`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Environment Variable: `VITE_API_URL=https://web-production-8d34f.up.railway.app`
- Rewrite/Redirect rule: `/*` → `/index.html` (Status `200`)
