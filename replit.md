# Template Tiles

A single-page web app for managing reusable text templates. Click a tile to copy its text to the clipboard.

## Architecture

- **Frontend-only app** using React + TypeScript with Vite
- Data persisted in **localStorage** (no backend/database needed)
- Uses shadcn/ui components, Tailwind CSS, and lucide-react icons

## Structure

- `client/src/pages/home.tsx` - Main page with dashboard, folder cards, template tiles, drag-and-drop, search, edit dialogs, import/export
- `client/src/App.tsx` - Router setup pointing to Home page
- `server/` - Standard Express server serving the Vite frontend (no custom API routes used)

## Key Features

- **Dashboard view** - main screen shows folder cards in a grid; click to open
- **Folder cards** - visual cards representing folders (Emails, Finance, etc.); act as drag-and-drop targets
- **Folder view** - click a folder card to see its templates; back button returns to dashboard
- **Drag and drop** - drag template tiles onto folder cards (on dashboard) or onto a floating drop-zone bar (when inside a folder) to move templates between folders
- **Folder CRUD** - create, rename, delete folders via dialogs
- **Template CRUD** - create, edit, delete template tiles with folder assignment
- **Copy on click** - click any tile to copy its body text to clipboard with toast feedback
- **Global search** - search from dashboard shows results across all folders
- **Export/Import** - download templates + folders as JSON, or import from JSON
- **localStorage persistence** - data survives page refreshes

## Data Storage

- All data stored in `localStorage` under key `template-tiles-data`
- Format: `{ folders: [{ id, name }], tiles: [{ id, title, body, folderId }] }`
- Backward compatible: reads old flat array format and migrates to new structure

## Running

- `npm run dev` starts the development server
