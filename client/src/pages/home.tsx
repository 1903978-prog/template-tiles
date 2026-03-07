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
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  FolderPlus,
  Inbox,
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
const ALL_FOLDER_ID = "__all__";
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
  const [activeFolder, setActiveFolder] = useState<string>(ALL_FOLDER_ID);
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

  const filteredTiles = tiles.filter((tile) => {
    if (activeFolder === ALL_FOLDER_ID) {
      // show all
    } else if (activeFolder === UNCATEGORIZED_ID) {
      if (tile.folderId !== null) return false;
    } else {
      if (tile.folderId !== activeFolder) return false;
    }

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      tile.title.toLowerCase().includes(q) ||
      tile.body.toLowerCase().includes(q)
    );
  });

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
          description:
            "Your browser blocked clipboard access. Please select the text manually and press Ctrl+C / Cmd+C.",
          variant: "destructive",
          duration: 5000,
        });
      }
    },
    [toast]
  );

  const addTile = () => {
    const defaultFolder = activeFolder === ALL_FOLDER_ID || activeFolder === UNCATEGORIZED_ID
      ? null
      : activeFolder;
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
  };

  const canReorder = !search.trim() && activeFolder === ALL_FOLDER_ID;

  const moveTile = (id: string, direction: -1 | 1) => {
    if (!canReorder) return;
    setTiles((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
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
    if (activeFolder === folderId) setActiveFolder(ALL_FOLDER_ID);
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
        arr.every(
          (t: any) => typeof t.title === "string" && typeof t.body === "string"
        );
      const validateFolders = (arr: any[]) =>
        arr.every(
          (f: any) => typeof f.id === "string" && typeof f.name === "string"
        );

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

  const uncategorizedCount = tiles.filter((t) => t.folderId === null).length;

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
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 flex-wrap">
              <Button size="sm" onClick={addTile} data-testid="button-add-tile">
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Add</span>
              </Button>
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

      <div className="border-b bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-2 overflow-x-auto" data-testid="folder-bar">
            <button
              data-testid="folder-tab-all"
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeFolder === ALL_FOLDER_ID
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveFolder(ALL_FOLDER_ID)}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              All
              <span className="text-xs opacity-70">({tiles.length})</span>
            </button>

            {folders.map((folder) => {
              const count = tiles.filter((t) => t.folderId === folder.id).length;
              const isActive = activeFolder === folder.id;
              const isConfirmingDelete = deleteFolderConfirmId === folder.id;

              return (
                <div key={folder.id} className="group/folder shrink-0 flex items-center relative">
                  <button
                    data-testid={`folder-tab-${folder.id}`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setActiveFolder(folder.id)}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    {folder.name}
                    <span className="text-xs opacity-70">({count})</span>
                  </button>
                  <div className="invisible group-hover/folder:visible flex items-center gap-0.5 ml-0.5">
                    <button
                      data-testid={`button-rename-folder-${folder.id}`}
                      className="p-0.5 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        openRenameFolder(folder);
                      }}
                      title="Rename folder"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      data-testid={`button-delete-folder-${folder.id}`}
                      className="p-0.5 rounded-sm text-muted-foreground hover:text-destructive transition-colors"
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
                        <Check className="w-3 h-3 text-destructive" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {uncategorizedCount > 0 && (
              <button
                data-testid="folder-tab-uncategorized"
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeFolder === UNCATEGORIZED_ID
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveFolder(UNCATEGORIZED_ID)}
              >
                <Inbox className="w-3.5 h-3.5" />
                Uncategorized
                <span className="text-xs opacity-70">({uncategorizedCount})</span>
              </button>
            )}

            <button
              data-testid="button-add-folder"
              className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={openAddFolder}
              title="Add folder"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New folder</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredTiles.length === 0 && search.trim() ? (
          <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="text-no-results">
            <Search className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No templates found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Try a different search term
            </p>
          </div>
        ) : filteredTiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="text-empty-state">
            <FolderOpen className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              {activeFolder !== ALL_FOLDER_ID && activeFolder !== UNCATEGORIZED_ID
                ? "This folder is empty"
                : "No templates yet"}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1 mb-4">
              {activeFolder !== ALL_FOLDER_ID && activeFolder !== UNCATEGORIZED_ID
                ? "Add a template to this folder to get started"
                : "Create your first template to get started"}
            </p>
            <Button onClick={addTile} data-testid="button-add-tile-empty">
              <Plus className="w-4 h-4 mr-1" />
              Add Template
            </Button>
          </div>
        ) : (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            }}
            data-testid="grid-tiles"
          >
            {filteredTiles.map((tile, idx) => {
              const isCopied = copiedId === tile.id;
              const isDeleting = deleteConfirmId === tile.id;
              const tileFolder = folders.find((f) => f.id === tile.folderId);

              return (
                <div
                  key={tile.id}
                  data-testid={`card-tile-${tile.id}`}
                  className={`group relative border rounded-md bg-card transition-all duration-200 cursor-pointer hover-elevate ${
                    isCopied ? "ring-2 ring-primary/50" : ""
                  }`}
                  style={{ aspectRatio: "1 / 1" }}
                  onClick={() => copyToClipboard(tile)}
                >
                  <div className="absolute inset-0 flex flex-col p-4 overflow-hidden rounded-md">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h3
                        className="text-sm font-semibold leading-tight truncate flex-1"
                        data-testid={`text-tile-title-${tile.id}`}
                      >
                        {tile.title || "Untitled"}
                      </h3>
                      <div className="flex items-center gap-0.5 invisible group-hover:visible transition-opacity opacity-0 group-hover:opacity-100 shrink-0">
                        {canReorder && (
                          <>
                            <button
                              data-testid={`button-move-left-${tile.id}`}
                              className="p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveTile(tile.id, -1);
                              }}
                              disabled={idx === 0}
                              title="Move left"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              data-testid={`button-move-right-${tile.id}`}
                              className="p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveTile(tile.id, 1);
                              }}
                              disabled={idx === filteredTiles.length - 1}
                              title="Move right"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
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

                    {activeFolder === ALL_FOLDER_ID && tileFolder && (
                      <span className="text-[10px] text-muted-foreground/60 mb-1 truncate" data-testid={`text-tile-folder-${tile.id}`}>
                        {tileFolder.name}
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
                          <Copy className="w-3 h-3" />
                          Click to copy
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

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
                      toast({
                        title: "Pasted from clipboard",
                        duration: 1500,
                      });
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
