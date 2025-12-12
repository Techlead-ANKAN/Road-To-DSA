# Road to DSA Frontend

React + Vite single-page application that renders Striver's A2Z DSA roadmap, tracks personal progress, and stores per-problem code snippets. Tailwind CSS powers the minimalist white UI and `@tanstack/react-query` handles data fetching.

## Available scripts

- `npm run dev` – start the development server with HMR
- `npm run build` – bundle the production build
- `npm run preview` – serve the production build locally
- `npm run lint` – run ESLint over the source files

## Environment variables

Create a `.env` file and set:

```
VITE_API_URL=http://localhost:5000
```

Point this variable to the Express backend base URL.

## Tech highlights

- React Router for dashboard, course, and profile flows
- Tailwind CSS + custom design tokens for a professional light/dark theme
- Monaco Editor modal for storing user solutions with language switching
- Recharts charts for progress analytics
- React Query for API caching and optimistic updates
