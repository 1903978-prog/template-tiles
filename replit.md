# Template Tiles

A single-page web app for managing reusable text templates. Click a tile to preview its text. Templates are organized hierarchically into folder cards on a dashboard.

## Architecture

- **Frontend-only app** using React + TypeScript with Vite
- Data persisted in **localStorage** (no backend/database needed)
- Uses shadcn/ui components, Tailwind CSS, and lucide-react icons

## Structure

- `client/src/pages/home.tsx` - Main page with persistent folder bar, template tiles, preview pane, drag-and-drop, search, edit dialogs, import/export
- `client/src/App.tsx` - Router setup pointing to Home page
- `server/` - Standard Express server serving the Vite frontend (no custom API routes used)

## Key Features

- **Persistent layout** - folders always visible at the top; preview pane always visible on the right (shows empty state when no tile selected)
- **Folder cards** - visual cards at the top; click to open a folder (shows its templates below); click again to close; active folder gets highlighted ring; also act as drag-and-drop targets
- **Uncategorized tiles** - shown directly on the dashboard below folder cards; clicking a tile turns all folder cards light green with "Click to move here" text; clicking a green folder card moves the template
- **Preview pane** - always-visible panel on the right; click any tile to see its full text with copy, edit, and close buttons; for uncategorized tiles, also shows "Move to" folder buttons
- **Drag and drop** - drag template tiles onto folder cards (on dashboard) or onto a floating drop-zone bar (when inside a folder) to move templates between folders
- **Folder CRUD** - create, rename, delete folders via dialogs
- **Template CRUD** - create, edit, delete template tiles with folder assignment
- **Copy to clipboard** - copy button in preview panel and on tile hover copies template text with toast feedback
- **Global search** - search from dashboard shows results across all folders; search inside a folder is scoped
- **Export/Import** - download templates + folders as JSON, or import from JSON
- **localStorage persistence** - data survives page refreshes

## Data Storage

- All data stored in `localStorage` under key `template-tiles-data`
- Format: `{ folders: [{ id, name }], tiles: [{ id, title, body, folderId }] }`
- Backward compatible: reads old flat array format and migrates to new structure

## Running

- `npm run dev` starts the development server
