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
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Copy,
  Pencil,
  Trash2,
  Download,
  Upload,
  X,
  Check,
  LayoutGrid,
  ClipboardPaste,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface TemplateTile {
  id: string;
  title: string;
  body: string;
}

const STORAGE_KEY = "template-tiles-data";

const DEFAULT_TILES: TemplateTile[] = [
  {
    id: "1",
    title: "Follow-up email",
    body: "Hi [Name],\n\nI wanted to follow up on our conversation from [date]. I'm still very interested in [topic] and would love to continue the discussion.\n\nPlease let me know if you have any availability this week.\n\nBest regards,\n[Your Name]",
  },
  {
    id: "2",
    title: "Meeting confirmation",
    body: "Hi [Name],\n\nThis is to confirm our meeting scheduled for:\n\nDate: [Date]\nTime: [Time]\nLocation: [Location/Link]\n\nPlease let me know if there are any changes. Looking forward to it.\n\nBest,\n[Your Name]",
  },
  {
    id: "3",
    title: "Thank you note",
    body: "Dear [Name],\n\nThank you so much for [reason]. I truly appreciate your time and generosity.\n\nYour support means a great deal to me, and I look forward to the opportunity to reciprocate.\n\nWith gratitude,\n[Your Name]",
  },
  {
    id: "4",
    title: "Proposal intro",
    body: "Dear [Name],\n\nI'm excited to present this proposal for [project/initiative]. After careful analysis of your needs, I believe this approach will deliver exceptional results.\n\nKey highlights:\n- [Benefit 1]\n- [Benefit 2]\n- [Benefit 3]\n\nI'd welcome the chance to discuss this in detail at your convenience.\n\nBest regards,\n[Your Name]",
  },
  {
    id: "5",
    title: "Reminder / nudge",
    body: "Hi [Name],\n\nJust a friendly reminder about [task/deadline/event]. The deadline is approaching on [date].\n\nIf you need any help or have questions, don't hesitate to reach out.\n\nThanks,\n[Your Name]",
  },
  {
    id: "6",
    title: "Internal update",
    body: "Team,\n\nHere's a quick update on [project/topic]:\n\nProgress:\n- [Update 1]\n- [Update 2]\n\nNext steps:\n- [Action item 1]\n- [Action item 2]\n\nPlease flag any blockers or concerns. Let's sync at our next standup.\n\nThanks,\n[Your Name]",
  },
];

function loadTiles(): TemplateTile[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return DEFAULT_TILES;
}

function saveTiles(tiles: TemplateTile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tiles));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function Home() {
  const [tiles, setTiles] = useState<TemplateTile[]>(loadTiles);
  const [search, setSearch] = useState("");
  const [editingTile, setEditingTile] = useState<TemplateTile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const { toast } = useToast();
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    saveTiles(tiles);
  }, [tiles]);

  const filteredTiles = tiles.filter((tile) => {
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
    const newTile: TemplateTile = {
      id: generateId(),
      title: "",
      body: "",
    };
    setEditTitle("");
    setEditBody("");
    setEditingTile(newTile);
    setEditDialogOpen(true);
  };

  const startEdit = (tile: TemplateTile) => {
    setEditTitle(tile.title);
    setEditBody(tile.body);
    setEditingTile(tile);
    setEditDialogOpen(true);
  };

  const saveEdit = () => {
    if (!editingTile) return;
    const updated = {
      ...editingTile,
      title: editTitle.trim() || "Untitled",
      body: editBody,
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

  const moveTile = (id: string, direction: -1 | 1) => {
    if (search.trim()) return;
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

  const exportTemplates = () => {
    const json = JSON.stringify(tiles, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-tiles.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Exported",
      description: `${tiles.length} templates exported as JSON`,
      duration: 2000,
    });
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) throw new Error("Not an array");
      const valid = parsed.every(
        (t: any) =>
          typeof t.title === "string" && typeof t.body === "string"
      );
      if (!valid) throw new Error("Invalid structure");
      const imported: TemplateTile[] = parsed.map((t: any) => ({
        id: t.id || generateId(),
        title: t.title,
        body: t.body,
      }));
      setTiles(imported);
      setImportDialogOpen(false);
      setImportText("");
      toast({
        title: "Imported",
        description: `${imported.length} templates imported successfully`,
        duration: 2000,
      });
    } catch {
      toast({
        title: "Import failed",
        description: "Invalid JSON format. Expected an array of templates with title and body fields.",
        variant: "destructive",
        duration: 4000,
      });
    }
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
            <LayoutGrid className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No templates yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1 mb-4">
              Create your first template to get started
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

              return (
                <div
                  key={tile.id}
                  data-testid={`card-tile-${tile.id}`}
                  className={`group relative border rounded-md bg-card transition-all duration-200 cursor-pointer hover-elevate ${
                    isCopied
                      ? "ring-2 ring-primary/50"
                      : ""
                  }`}
                  style={{ aspectRatio: "1 / 1" }}
                  onClick={() => copyToClipboard(tile)}
                >
                  <div className="absolute inset-0 flex flex-col p-4 overflow-hidden rounded-md">
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <h3
                        className="text-sm font-semibold leading-tight truncate flex-1"
                        data-testid={`text-tile-title-${tile.id}`}
                      >
                        {tile.title || "Untitled"}
                      </h3>
                      <div className="flex items-center gap-0.5 invisible group-hover:visible transition-opacity opacity-0 group-hover:opacity-100 shrink-0">
                        {!search.trim() && (
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
            placeholder='[{"title": "...", "body": "..."}]'
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
