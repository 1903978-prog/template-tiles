# Template Tiles

A single-page web app for managing reusable text templates. Click a tile to copy its text to the clipboard.

## Architecture

- **Frontend-only app** using React + TypeScript with Vite
- Data persisted in **localStorage** (no backend/database needed)
- Uses shadcn/ui components, Tailwind CSS, and lucide-react icons

## Structure

- `client/src/pages/home.tsx` - Main page with all Template Tiles logic (grid, folders, search, edit dialog, import/export)
- `client/src/App.tsx` - Router setup pointing to Home page
- `server/` - Standard Express server serving the Vite frontend (no custom API routes used)

## Key Features

- **Folders** - organize templates into folders (Emails, Finance, etc.) with create, rename, delete
- Responsive grid of square tiles with copy-on-click
- Create, edit, delete templates via modal dialog with folder assignment
- Folder tab bar for navigation: All, per-folder, Uncategorized
- Search/filter tiles by title or body text
- Move tiles left/right to reorder
- Export/Import templates + folders as JSON
- 3 default folders + 6 default templates on first load
- Toast notifications for copy feedback
- Clipboard fallback error handling

## Data Storage

- All data stored in `localStorage` under key `template-tiles-data`
- Format: `{ folders: [{ id, name }], tiles: [{ id, title, body, folderId }] }`
- Backward compatible: reads old flat array format and migrates to new structure

## Running

- `npm run dev` starts the development server
