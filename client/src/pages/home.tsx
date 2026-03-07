import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Copy,
  Pencil,
  Trash2,
  Download,
  Upload,
  Check,
  LayoutGrid,
  ClipboardPaste,
  FolderOpen,
  FolderPlus,
  Inbox,
  GripVertical,
  X,
  FileText,
} from "lucide-react";

interface Folder {
  id: string;
  name: string;
}

interface TemplateTile {
  id: string;
  title: string;
  body: string;
  folderId: string | null;
}

interface AppData {
  folders: Folder[];
  tiles: TemplateTile[];
}

const STORAGE_KEY = "template-tiles-data";
const UNCATEGORIZED_ID = "__uncategorized__";

const DEFAULT_FOLDERS: Folder[] = [
  { id: "folder-emails", name: "Emails" },
  { id: "folder-finance", name: "Finance" },
  { id: "folder-internal", name: "Internal" },
];

const DEFAULT_TILES: TemplateTile[] = [
  {
    id: "1",
    title: "Follow-up email",
    body: "Hi [Name],\n\nI wanted to follow up on our conversation from [date]. I'm still very interested in [topic] and would love to continue the discussion.\n\nPlease let me know if you have any availability this week.\n\nBest regards,\n[Your Name]",
    folderId: "folder-emails",
  },
  {
    id: "2",
    title: "Meeting confirmation",
    body: "Hi [Name],\n\nThis is to confirm our meeting scheduled for:\n\nDate: [Date]\nTime: [Time]\nLocation: [Location/Link]\n\nPlease let me know if there are any changes. Looking forward to it.\n\nBest,\n[Your Name]",
    folderId: "folder-emails",
  },
  {
    id: "3",
    title: "Thank you note",
    body: "Dear [Name],\n\nThank you so much for [reason]. I truly appreciate your time and generosity.\n\nYour support means a great deal to me, and I look forward to the opportunity to reciprocate.\n\nWith gratitude,\n[Your Name]",
    folderId: "folder-emails",
  },
  {
    id: "4",
    title: "Proposal intro",
    body: "Dear [Name],\n\nI'm excited to present this proposal for [project/initiative]. After careful analysis of your needs, I believe this approach will deliver exceptional results.\n\nKey highlights:\n- [Benefit 1]\n- [Benefit 2]\n- [Benefit 3]\n\nI'd welcome the chance to discuss this in detail at your convenience.\n\nBest regards,\n[Your Name]",
    folderId: "folder-finance",
  },
  {
    id: "5",
    title: "Reminder / nudge",
    body: "Hi [Name],\n\nJust a friendly reminder about [task/deadline/event]. The deadline is approaching on [date].\n\nIf you need any help or have questions, don't hesitate to reach out.\n\nThanks,\n[Your Name]",
    folderId: null,
  },
  {
    id: "6",
    title: "Internal update",
    body: "Team,\n\nHere's a quick update on [project/topic]:\n\nProgress:\n- [Update 1]\n- [Update 2]\n\nNext steps:\n- [Action item 1]\n- [Action item 2]\n\nPlease flag any blockers or concerns. Let's sync at our next standup.\n\nThanks,\n[Your Name]",
    folderId: "folder-internal",
  },
];

function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.folders && parsed.tiles) {
        return {
          folders: parsed.folders,
          tiles: parsed.tiles.map((t: any) => ({
            ...t,
            folderId: t.folderId ?? null,
          })),
        };
      }
      if (Array.isArray(parsed)) {
        return {
          folders: [],
          tiles: parsed.map((t: any) => ({ ...t, folderId: null })),
        };
      }
    }
  } catch {
    // ignore
  }
  return { folders: DEFAULT_FOLDERS, tiles: DEFAULT_TILES };
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function Home() {
  const [data, setData] = useState<AppData>(loadData);
  const [search, setSearch] = useState("");
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [editingTile, setEditingTile] = useState<TemplateTile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editFolderId, setEditFolderId] = useState<string | null>(null);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderDialogMode, setFolderDialogMode] = useState<"add" | "rename">("add");
  const [folderName, setFolderName] = useState("");
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [deleteFolderConfirmId, setDeleteFolderConfirmId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [draggingTileId, setDraggingTileId] = useState<string | null>(null);
  const [previewTileId, setPreviewTileId] = useState<string | null>(null);
  const [draggingFolderId, setDraggingFolderId] = useState<string | null>(null);
  const [folderDropTargetId, setFolderDropTargetId] = useState<string | null>(null);
  const { toast } = useToast();
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { folders, tiles } = data;

  useEffect(() => {
    saveData(data);
  }, [data]);

  const setTiles = (updater: (prev: TemplateTile[]) => TemplateTile[]) => {
    setData((prev) => ({ ...prev, tiles: updater(prev.tiles) }));
  };

  const setFolders = (updater: (prev: Folder[]) => Folder[]) => {
    setData((prev) => ({ ...prev, folders: updater(prev.folders) }));
  };

  const isOnDashboard = openFolderId === null;
  const currentFolderName = openFolderId
    ? folders.find((f) => f.id === openFolderId)?.name || "Folder"
    : null;

  const visibleTiles = openFolderId
    ? tiles.filter((t) => t.folderId === openFolderId)
    : [];

  const filteredTiles = search.trim()
    ? (isOnDashboard ? tiles : visibleTiles).filter((tile) => {
        const q = search.toLowerCase();
        return tile.title.toLowerCase().includes(q) || tile.body.toLowerCase().includes(q);
      })
    : visibleTiles;

  const searchResultsGlobal = isOnDashboard && search.trim()
    ? tiles.filter((tile) => {
        const q = search.toLowerCase();
        return tile.title.toLowerCase().includes(q) || tile.body.toLowerCase().includes(q);
      })
    : null;

  const copyToClipboard = useCallback(
    async (tile: TemplateTile) => {
      try {
        await navigator.clipboard.writeText(tile.body);
        setCopiedId(tile.id);
        if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
        copiedTimeoutRef.current = setTimeout(() => setCopiedId(null), 1500);
        toast({
          title: "Copied!",
          description: `"${tile.title}" copied to clipboard`,
          duration: 2000,
        });
      } catch {
        toast({
          title: "Clipboard unavailable",
          description: "Your browser blocked clipboard access. Please select the text manually and press Ctrl+C / Cmd+C.",
          variant: "destructive",
          duration: 5000,
        });
      }
    },
    [toast]
  );

  const addTile = () => {
    const defaultFolder = openFolderId;
    const newTile: TemplateTile = {
      id: generateId(),
      title: "",
      body: "",
      folderId: defaultFolder,
    };
    setEditTitle("");
    setEditBody("");
    setEditFolderId(defaultFolder);
    setEditingTile(newTile);
    setEditDialogOpen(true);
  };

  const startEdit = (tile: TemplateTile) => {
    setEditTitle(tile.title);
    setEditBody(tile.body);
    setEditFolderId(tile.folderId);
    setEditingTile(tile);
    setEditDialogOpen(true);
  };

  const saveEdit = () => {
    if (!editingTile) return;
    const updated: TemplateTile = {
      ...editingTile,
      title: editTitle.trim() || "Untitled",
      body: editBody,
      folderId: editFolderId,
    };
    setTiles((prev) => {
      const exists = prev.find((t) => t.id === updated.id);
      if (exists) {
        return prev.map((t) => (t.id === updated.id ? updated : t));
      }
      return [...prev, updated];
    });
    setEditDialogOpen(false);
    setEditingTile(null);
  };

  const deleteTile = (id: string) => {
    setTiles((prev) => prev.filter((t) => t.id !== id));
    setDeleteConfirmId(null);
    if (previewTileId === id) setPreviewTileId(null);
  };

  const moveTileToFolder = (tileId: string, targetFolderId: string | null) => {
    setTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, folderId: targetFolderId } : t))
    );
    const folderLabel = targetFolderId
      ? folders.find((f) => f.id === targetFolderId)?.name || "folder"
      : "Uncategorized";
    toast({
      title: "Moved",
      description: `Template moved to ${folderLabel}`,
      duration: 1500,
    });
  };

  const openAddFolder = () => {
    setFolderDialogMode("add");
    setFolderName("");
    setRenamingFolderId(null);
    setFolderDialogOpen(true);
  };

  const openRenameFolder = (folder: Folder) => {
    setFolderDialogMode("rename");
    setFolderName(folder.name);
    setRenamingFolderId(folder.id);
    setFolderDialogOpen(true);
  };

  const saveFolder = () => {
    const name = folderName.trim();
    if (!name) return;
    if (folderDialogMode === "add") {
      setFolders((prev) => [...prev, { id: generateId(), name }]);
      toast({ title: "Folder created", description: `"${name}" added`, duration: 2000 });
    } else if (renamingFolderId) {
      setFolders((prev) =>
        prev.map((f) => (f.id === renamingFolderId ? { ...f, name } : f))
      );
      toast({ title: "Folder renamed", description: `Renamed to "${name}"`, duration: 2000 });
    }
    setFolderDialogOpen(false);
  };

  const deleteFolder = (folderId: string) => {
    setData((prev) => ({
      folders: prev.folders.filter((f) => f.id !== folderId),
      tiles: prev.tiles.map((t) =>
        t.folderId === folderId ? { ...t, folderId: null } : t
      ),
    }));
    if (openFolderId === folderId) setOpenFolderId(null);
    setDeleteFolderConfirmId(null);
    toast({ title: "Folder deleted", description: "Templates moved to Uncategorized", duration: 2000 });
  };

  const exportTemplates = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-tiles.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Exported",
      description: `${tiles.length} templates and ${folders.length} folders exported`,
      duration: 2000,
    });
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText);
      const validateTiles = (arr: any[]) =>
        arr.every((t: any) => typeof t.title === "string" && typeof t.body === "string");
      const validateFolders = (arr: any[]) =>
        arr.every((f: any) => typeof f.id === "string" && typeof f.name === "string");

      if (parsed.folders && parsed.tiles) {
        if (!Array.isArray(parsed.folders) || !Array.isArray(parsed.tiles))
          throw new Error("Invalid format");
        if (!validateFolders(parsed.folders) || !validateTiles(parsed.tiles))
          throw new Error("Invalid structure");
        setData({
          folders: parsed.folders,
          tiles: parsed.tiles.map((t: any) => ({
            id: t.id || generateId(),
            title: t.title,
            body: t.body,
            folderId: t.folderId ?? null,
          })),
        });
      } else if (Array.isArray(parsed)) {
        if (!validateTiles(parsed)) throw new Error("Invalid structure");
        setData((prev) => ({
          ...prev,
          tiles: parsed.map((t: any) => ({
            id: t.id || generateId(),
            title: t.title,
            body: t.body,
            folderId: t.folderId ?? null,
          })),
        }));
      } else {
        throw new Error("Invalid format");
      }
      setImportDialogOpen(false);
      setImportText("");
      setOpenFolderId(null);
      toast({ title: "Imported", description: "Templates imported successfully", duration: 2000 });
    } catch {
      toast({
        title: "Import failed",
        description: "Invalid JSON format. Expected {folders, tiles} or an array of templates.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  const handleTileDragStart = (e: React.DragEvent, tileId: string) => {
    e.dataTransfer.setData("text/plain", tileId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingTileId(tileId);
  };

  const handleTileDragEnd = () => {
    setDraggingTileId(null);
    setDragOverFolderId(null);
  };

  const handleFolderDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverFolderId(folderId);
  };

  const handleFolderDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleFolderDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    const tileId = e.dataTransfer.getData("text/plain");
    if (tileId) {
      moveTileToFolder(tileId, targetFolderId);
    }
    setDragOverFolderId(null);
    setDraggingTileId(null);
  };

  const handleFolderCardDragStart = (e: React.DragEvent, folderId: string) => {
    e.dataTransfer.setData("application/folder-id", folderId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingFolderId(folderId);
  };

  const handleFolderCardDragEnd = () => {
    setDraggingFolderId(null);
    setFolderDropTargetId(null);
  };

  const handleFolderCardDragOver = (e: React.DragEvent, targetFolderId: string) => {
    if (!draggingFolderId || draggingFolderId === targetFolderId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setFolderDropTargetId(targetFolderId);
  };

  const handleFolderCardDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    const sourceFolderId = e.dataTransfer.getData("application/folder-id");
    if (!sourceFolderId || sourceFolderId === targetFolderId) {
      setDraggingFolderId(null);
      setFolderDropTargetId(null);
      return;
    }
    setFolders((prev) => {
      const fromIndex = prev.findIndex((f) => f.id === sourceFolderId);
      const toIndex = prev.findIndex((f) => f.id === targetFolderId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
    setDraggingFolderId(null);
    setFolderDropTargetId(null);
  };

  const uncategorizedTiles = tiles.filter((t) => t.folderId === null);
  const uncategorizedCount = uncategorizedTiles.length;

  const previewTile = previewTileId ? tiles.find((t) => t.id === previewTileId) : null;

  const renderTileCard = (tile: TemplateTile) => {
    const isCopied = copiedId === tile.id;
    const isDeleting = deleteConfirmId === tile.id;
    const isDragging = draggingTileId === tile.id;
    const isPreviewed = previewTileId === tile.id;

    return (
      <div
        key={tile.id}
        data-testid={`card-tile-${tile.id}`}
        draggable
        onDragStart={(e) => handleTileDragStart(e, tile.id)}
        onDragEnd={handleTileDragEnd}
        className={`group relative border rounded-md bg-card transition-all duration-200 cursor-pointer hover-elevate ${
          isPreviewed ? "ring-2 ring-primary border-primary/50" : isCopied ? "ring-2 ring-primary/50" : ""
        } ${isDragging ? "opacity-40" : ""}`}
        style={{ aspectRatio: "1 / 1" }}
        onClick={() => setPreviewTileId(isPreviewed ? null : tile.id)}
      >
        <div className="absolute inset-0 flex flex-col p-4 overflow-hidden rounded-md">
          <div className="flex items-start justify-between gap-1 mb-1">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 cursor-grab" />
              <h3
                className="text-sm font-semibold leading-tight truncate"
                data-testid={`text-tile-title-${tile.id}`}
              >
                {tile.title || "Untitled"}
              </h3>
            </div>
            <div className="flex items-center gap-0.5 invisible group-hover:visible transition-opacity opacity-0 group-hover:opacity-100 shrink-0">
              <button
                data-testid={`button-copy-tile-${tile.id}`}
                className="p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(tile);
                }}
                title="Copy"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                data-testid={`button-edit-${tile.id}`}
                className="p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(tile);
                }}
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                data-testid={`button-delete-${tile.id}`}
                className="p-1 rounded-sm text-muted-foreground hover:text-destructive transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isDeleting) {
                    deleteTile(tile.id);
                  } else {
                    setDeleteConfirmId(tile.id);
                    setTimeout(() => setDeleteConfirmId(null), 3000);
                  }
                }}
                title={isDeleting ? "Click again to confirm" : "Delete"}
              >
                {isDeleting ? (
                  <Check className="w-3.5 h-3.5 text-destructive" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {isOnDashboard && tile.folderId && (
            <span className="text-[10px] text-muted-foreground/60 mb-1 truncate">
              {folders.find((f) => f.id === tile.folderId)?.name}
            </span>
          )}

          <p
            className="text-xs text-muted-foreground leading-relaxed flex-1 whitespace-pre-wrap overflow-hidden"
            data-testid={`text-tile-body-${tile.id}`}
          >
            {tile.body || "Empty template"}
          </p>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            {isCopied ? (
              <span className="text-xs font-medium text-primary flex items-center gap-1" data-testid={`text-copied-${tile.id}`}>
                <Check className="w-3 h-3" />
                Copied!
              </span>
            ) : (
              <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Click to preview
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 h-16">
            <div className="flex items-center gap-2 shrink-0">
              <LayoutGrid className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-semibold tracking-tight" data-testid="text-app-title">
                Template Tiles
              </h1>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-testid="input-search"
                  type="search"
                  placeholder={isOnDashboard ? "Search all templates..." : `Search in ${currentFolderName}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 flex-wrap">
              <Button
                size="sm"
                variant="secondary"
                onClick={exportTemplates}
                data-testid="button-export"
              >
                <Download className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setImportDialogOpen(true)}
                data-testid="button-import"
              >
                <Upload className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Import</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground" data-testid="text-section-folders">Folders</h2>
          <Button size="sm" variant="secondary" onClick={openAddFolder} data-testid="button-add-folder">
            <FolderPlus className="w-4 h-4 mr-1" />
            New folder
          </Button>
        </div>

        <div
          className="grid gap-4 mb-6"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
          data-testid="grid-folders"
        >
              {folders.map((folder) => {
                const count = tiles.filter((t) => t.folderId === folder.id).length;
                const isConfirmingDelete = deleteFolderConfirmId === folder.id;
                const isDragOver = dragOverFolderId === folder.id;
                const isMoveTarget = previewTileId !== null && uncategorizedTiles.some((t) => t.id === previewTileId);
                const isActive = openFolderId === folder.id;

                const isFolderDragging = draggingFolderId === folder.id;
                const isFolderDropTarget = folderDropTargetId === folder.id;

                return (
                  <div
                    key={folder.id}
                    data-testid={`card-folder-${folder.id}`}
                    draggable
                    onDragStart={(e) => handleFolderCardDragStart(e, folder.id)}
                    onDragEnd={handleFolderCardDragEnd}
                    className={`group/folder relative border rounded-md cursor-pointer hover-elevate transition-all duration-200 ${
                      isFolderDragging
                        ? "opacity-40"
                        : isFolderDropTarget && draggingFolderId
                          ? "ring-2 ring-blue-400 border-blue-400 bg-blue-50 dark:bg-blue-950/30"
                          : isMoveTarget
                            ? "bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/40 hover:border-green-400 dark:hover:border-green-600"
                            : isActive
                              ? "ring-2 ring-primary border-primary/50 bg-primary/5"
                              : isDragOver
                                ? "ring-2 ring-primary border-primary/50 bg-primary/5 bg-card"
                                : "bg-card"
                    }`}
                    style={{ aspectRatio: "4 / 3" }}
                    onClick={() => {
                      if (draggingFolderId) return;
                      if (isActive) {
                        setOpenFolderId(null);
                        setSearch("");
                        setPreviewTileId(null);
                      } else if (isMoveTarget && previewTileId) {
                        moveTileToFolder(previewTileId, folder.id);
                        setPreviewTileId(null);
                      } else {
                        setOpenFolderId(folder.id);
                        setPreviewTileId(null);
                        setSearch("");
                      }
                    }}
                    onDragOver={(e) => {
                      if (draggingFolderId) {
                        handleFolderCardDragOver(e, folder.id);
                      } else {
                        handleFolderDragOver(e, folder.id);
                      }
                    }}
                    onDragLeave={() => {
                      handleFolderDragLeave();
                      setFolderDropTargetId(null);
                    }}
                    onDrop={(e) => {
                      if (draggingFolderId) {
                        handleFolderCardDrop(e, folder.id);
                      } else {
                        handleFolderDrop(e, folder.id);
                      }
                    }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 rounded-md">
                      <FolderOpen className={`w-10 h-10 mb-3 transition-colors ${
                        isMoveTarget ? "text-green-500 dark:text-green-400" : isDragOver ? "text-primary" : "text-muted-foreground/50"
                      }`} />
                      <h3 className="text-sm font-semibold text-center truncate w-full" data-testid={`text-folder-name-${folder.id}`}>
                        {folder.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isMoveTarget ? "Click to move here" : `${count} ${count === 1 ? "template" : "templates"}`}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2 invisible group-hover/folder:visible flex items-center gap-0.5">
                      <button
                        data-testid={`button-rename-folder-${folder.id}`}
                        className="p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors bg-card/80 backdrop-blur"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRenameFolder(folder);
                        }}
                        title="Rename folder"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        data-testid={`button-delete-folder-${folder.id}`}
                        className="p-1 rounded-sm text-muted-foreground hover:text-destructive transition-colors bg-card/80 backdrop-blur"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isConfirmingDelete) {
                            deleteFolder(folder.id);
                          } else {
                            setDeleteFolderConfirmId(folder.id);
                            setTimeout(() => setDeleteFolderConfirmId(null), 3000);
                          }
                        }}
                        title={isConfirmingDelete ? "Click again to confirm" : "Delete folder"}
                      >
                        {isConfirmingDelete ? (
                          <Check className="w-3.5 h-3.5 text-destructive" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

        {isOnDashboard && !searchResultsGlobal && uncategorizedTiles.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2" data-testid="text-section-uncategorized">
                    <Inbox className="w-4 h-4 text-muted-foreground" />
                    Uncategorized
                    <span className="text-sm font-normal text-muted-foreground">({uncategorizedTiles.length})</span>
                  </h2>
                </div>
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
                  data-testid="grid-uncategorized"
                >
                  {uncategorizedTiles.map((tile) => {
                    const isCopied = copiedId === tile.id;
                    const isDeleting = deleteConfirmId === tile.id;
                    const isDragging = draggingTileId === tile.id;
                    const isPreviewed = previewTileId === tile.id;

                    return (
                      <div key={tile.id} className="flex flex-col gap-2">
                        <div
                          data-testid={`card-tile-${tile.id}`}
                          draggable
                          onDragStart={(e) => handleTileDragStart(e, tile.id)}
                          onDragEnd={handleTileDragEnd}
                          className={`group relative border rounded-md bg-card transition-all duration-200 cursor-pointer hover-elevate ${
                            isPreviewed ? "ring-2 ring-primary border-primary/50" : isCopied ? "ring-2 ring-primary/50" : ""
                          } ${isDragging ? "opacity-40" : ""}`}
                          style={{ aspectRatio: "1 / 1" }}
                          onClick={() => {
                            setPreviewTileId(previewTileId === tile.id ? null : tile.id);
                          }}
                        >
                          <div className="absolute inset-0 flex flex-col p-4 overflow-hidden rounded-md">
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <div className="flex items-center gap-1 flex-1 min-w-0">
                                <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 cursor-grab" />
                                <h3
                                  className="text-sm font-semibold leading-tight truncate"
                                  data-testid={`text-tile-title-${tile.id}`}
                                >
                                  {tile.title || "Untitled"}
                                </h3>
                              </div>
                              <div className="flex items-center gap-0.5 invisible group-hover:visible transition-opacity opacity-0 group-hover:opacity-100 shrink-0">
                                <button
                                  data-testid={`button-copy-${tile.id}`}
                                  className="p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(tile);
                                  }}
                                  title="Copy"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  data-testid={`button-edit-${tile.id}`}
                                  className="p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEdit(tile);
                                  }}
                                  title="Edit"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  data-testid={`button-delete-${tile.id}`}
                                  className="p-1 rounded-sm text-muted-foreground hover:text-destructive transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isDeleting) {
                                      deleteTile(tile.id);
                                    } else {
                                      setDeleteConfirmId(tile.id);
                                      setTimeout(() => setDeleteConfirmId(null), 3000);
                                    }
                                  }}
                                  title={isDeleting ? "Click again to confirm" : "Delete"}
                                >
                                  {isDeleting ? (
                                    <Check className="w-3.5 h-3.5 text-destructive" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <p
                              className="text-xs text-muted-foreground leading-relaxed flex-1 whitespace-pre-wrap overflow-hidden"
                              data-testid={`text-tile-body-${tile.id}`}
                            >
                              {tile.body || "Empty template"}
                            </p>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                              {isCopied ? (
                                <span className="text-xs font-medium text-primary flex items-center gap-1" data-testid={`text-copied-${tile.id}`}>
                                  <Check className="w-3 h-3" />
                                  Copied!
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                                  <FolderPlus className="w-3 h-3" />
                                  Click to assign folder
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </>
            )}

        {isOnDashboard && searchResultsGlobal ? (
          <>
            {searchResultsGlobal.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="text-no-results">
                <Search className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No templates found</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term</p>
              </div>
            ) : (
              <>
                <h2 className="text-base font-semibold text-foreground mb-4" data-testid="text-section-search-results">
                  Search results ({searchResultsGlobal.length})
                </h2>
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
                  data-testid="grid-tiles"
                >
                  {searchResultsGlobal.map(renderTileCard)}
                </div>
              </>
            )}
          </>
        ) : null}

        {!isOnDashboard ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2" data-testid="text-current-folder-label">
                <FolderOpen className="w-4 h-4 text-muted-foreground" />
                {currentFolderName}
              </h2>
              <Button size="sm" onClick={addTile} data-testid="button-add-tile">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            {filteredTiles.length === 0 && search.trim() ? (
              <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="text-no-results">
                <Search className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No templates found</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term</p>
              </div>
            ) : filteredTiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="text-empty-state">
                <FolderOpen className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">This folder is empty</p>
                <p className="text-sm text-muted-foreground/70 mt-1 mb-4">
                  Add a template or drag one here from another folder
                </p>
                <Button onClick={addTile} data-testid="button-add-tile-empty">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Template
                </Button>
              </div>
            ) : (
              <div
                className="grid gap-4 pb-20"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
                data-testid="grid-tiles"
              >
                {filteredTiles.map(renderTileCard)}
              </div>
            )}
          </>
        ) : null}

        {isOnDashboard && !searchResultsGlobal && uncategorizedTiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="text-dashboard-empty">
            <ClipboardPaste className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">Click a folder to view its templates</p>
          </div>
        )}

          </div>

          <div
            className="w-80 lg:w-96 shrink-0 hidden md:block sticky top-[73px] self-start border rounded-lg bg-card overflow-hidden flex flex-col"
            data-testid="panel-preview"
            style={{ height: "calc(100vh - 97px)" }}
          >
              {previewTile ? (
                <>
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <h3 className="text-sm font-semibold truncate flex-1 mr-2" data-testid="preview-title">
                      {previewTile.title || "Untitled"}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        data-testid="button-preview-copy"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        onClick={() => copyToClipboard(previewTile)}
                        title="Copy to clipboard"
                      >
                        {copiedId === previewTile.id ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        data-testid="button-preview-edit"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        onClick={() => startEdit(previewTile)}
                        title="Edit template"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        data-testid="button-preview-close"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        onClick={() => setPreviewTileId(null)}
                        title="Close preview"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {previewTile.folderId && (
                    <div className="px-4 py-2 border-b bg-muted/10">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FolderOpen className="w-3 h-3" />
                        {folders.find((f) => f.id === previewTile.folderId)?.name || "Unknown folder"}
                      </span>
                    </div>
                  )}
                  {!previewTile.folderId && folders.length > 0 && (
                    <div className="px-4 py-2 border-b bg-muted/10">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">Move to:</span>
                        {folders.map((f) => (
                          <button
                            key={f.id}
                            data-testid={`preview-move-to-${f.id}`}
                            className="flex items-center gap-1 px-2 py-0.5 rounded border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                            onClick={() => {
                              moveTileToFolder(previewTile.id, f.id);
                              setPreviewTileId(null);
                            }}
                          >
                            <FolderOpen className="w-3 h-3" />
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="p-4 flex-1 overflow-y-auto">
                    <p
                      className="text-sm text-foreground leading-relaxed whitespace-pre-wrap"
                      data-testid="preview-body"
                    >
                      {previewTile.body || "Empty template"}
                    </p>
                  </div>
                  <div className="px-4 py-3 border-t bg-muted/10">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => copyToClipboard(previewTile)}
                      data-testid="button-preview-copy-full"
                    >
                      {copiedId === previewTile.id ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy to Clipboard
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 px-4 text-center" data-testid="preview-empty">
                  <FileText className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Select a template to preview</p>
                </div>
              )}
          </div>
        </div>
      </main>

      {draggingTileId && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 animate-in slide-in-from-bottom-full duration-200"
          data-testid="drag-drop-bar"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Drop into a folder:</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {folders
                .filter((f) => f.id !== openFolderId)
                .map((folder) => {
                  const isDragOver = dragOverFolderId === folder.id;
                  return (
                    <div
                      key={folder.id}
                      data-testid={`drop-target-${folder.id}`}
                      className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-md border-2 border-dashed transition-all cursor-default ${
                        isDragOver
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                      onDragOver={(e) => handleFolderDragOver(e, folder.id)}
                      onDragLeave={handleFolderDragLeave}
                      onDrop={(e) => handleFolderDrop(e, folder.id)}
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span className="text-sm font-medium">{folder.name}</span>
                    </div>
                  );
                })}
              <div
                data-testid="drop-target-uncategorized"
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-md border-2 border-dashed transition-all cursor-default ${
                  dragOverFolderId === UNCATEGORIZED_ID
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
                onDragOver={(e) => handleFolderDragOver(e, UNCATEGORIZED_ID)}
                onDragLeave={handleFolderDragLeave}
                onDrop={(e) => handleFolderDrop(e, null)}
              >
                <Inbox className="w-4 h-4" />
                <span className="text-sm font-medium">Uncategorized</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) {
          setEditingTile(null);
          setEditTitle("");
          setEditBody("");
          setEditFolderId(null);
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              {editingTile && tiles.find((t) => t.id === editingTile.id)
                ? "Edit Template"
                : "New Template"}
            </DialogTitle>
            <DialogDescription>
              Add a title and paste or type your template text below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title</label>
              <Input
                data-testid="input-edit-title"
                placeholder="e.g. Follow-up email"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Folder</label>
              <Select
                value={editFolderId ?? UNCATEGORIZED_ID}
                onValueChange={(val) =>
                  setEditFolderId(val === UNCATEGORIZED_ID ? null : val)
                }
              >
                <SelectTrigger data-testid="select-folder">
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNCATEGORIZED_ID}>Uncategorized</SelectItem>
                  {folders.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Template text</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setEditBody(text);
                      toast({ title: "Pasted from clipboard", duration: 1500 });
                    } catch {
                      toast({
                        title: "Paste failed",
                        description: "Use Ctrl+V / Cmd+V to paste instead",
                        variant: "destructive",
                        duration: 3000,
                      });
                    }
                  }}
                  data-testid="button-paste-helper"
                >
                  <ClipboardPaste className="w-3.5 h-3.5 mr-1" />
                  Paste
                </Button>
              </div>
              <Textarea
                data-testid="input-edit-body"
                placeholder="Type or paste your template text here..."
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                className="min-h-[200px] resize-y font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setEditDialogOpen(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button onClick={saveEdit} data-testid="button-save-edit">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={folderDialogOpen} onOpenChange={(open) => {
        setFolderDialogOpen(open);
        if (!open) {
          setFolderName("");
          setRenamingFolderId(null);
        }
      }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle data-testid="text-folder-dialog-title">
              {folderDialogMode === "add" ? "New Folder" : "Rename Folder"}
            </DialogTitle>
            <DialogDescription>
              {folderDialogMode === "add"
                ? "Create a new folder to organize your templates."
                : "Enter a new name for this folder."}
            </DialogDescription>
          </DialogHeader>
          <Input
            data-testid="input-folder-name"
            placeholder="e.g. Emails, Finance, HR..."
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && folderName.trim()) saveFolder();
            }}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setFolderDialogOpen(false)}
              data-testid="button-cancel-folder"
            >
              Cancel
            </Button>
            <Button
              onClick={saveFolder}
              disabled={!folderName.trim()}
              data-testid="button-save-folder"
            >
              {folderDialogMode === "add" ? "Create" : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle data-testid="text-import-title">Import Templates</DialogTitle>
            <DialogDescription>
              Paste the JSON export below. This will replace all existing templates.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            data-testid="input-import-json"
            placeholder='{"folders": [...], "tiles": [...]}'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="min-h-[200px] resize-y font-mono text-sm"
          />

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setImportDialogOpen(false);
                setImportText("");
              }}
              data-testid="button-cancel-import"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!importText.trim()}
              data-testid="button-confirm-import"
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
