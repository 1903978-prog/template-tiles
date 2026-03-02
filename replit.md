# Template Tiles

A single-page web app for managing reusable text templates. Click a tile to copy its text to the clipboard.

## Architecture

- **Frontend-only app** using React + TypeScript with Vite
- Data persisted in **localStorage** (no backend/database needed)
- Uses shadcn/ui components, Tailwind CSS, and lucide-react icons

## Structure

- `client/src/pages/home.tsx` - Main page with all Template Tiles logic (grid, search, edit dialog, import/export)
- `client/src/App.tsx` - Router setup pointing to Home page
- `server/` - Standard Express server serving the Vite frontend (no custom API routes used)

## Key Features

- Responsive grid of square tiles with copy-on-click
- Create, edit, delete templates via modal dialog
- Search/filter tiles by title or body text
- Move tiles left/right to reorder
- Export templates as JSON file download
- Import templates from JSON
- 6 default sample tiles on first load
- Toast notifications for copy feedback
- Clipboard fallback error handling

## Data Storage

- All data stored in `localStorage` under key `template-tiles-data`
- Format: JSON array of `{ id, title, body }` objects

## Running

- `npm run dev` starts the development server
