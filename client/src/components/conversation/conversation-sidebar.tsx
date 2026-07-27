"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ConversationSummary } from "@/types";
import {
  PlusIcon,
  MessageSquareTextIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  RotateCcwIcon,
} from "lucide-react";

interface ConversationSidebarProps {
  conversations: ConversationSummary[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
  onSelect: (id: string) => void;
  onCreate: (title: string) => Promise<void>;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export function ConversationSidebar({
  conversations,
  selectedId,
  loading,
  error,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onRefresh,
}: ConversationSidebarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const handleCreate = async () => {
    const title = newTitle.trim();
    if (!title) return;
    await onCreate(title);
    setNewTitle("");
    setIsCreating(false);
  };

  const handleRenameSubmit = async (id: string) => {
    const title = renameValue.trim();
    if (!title) return;
    await onRename(id, title);
    setRenamingId(null);
    setRenameValue("");
  };

  const sorted = [...conversations].sort(
    (a, b) =>
      new Date(b.lastMessageAt ?? b.updatedAt).getTime() -
      new Date(a.lastMessageAt ?? a.updatedAt).getTime()
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Conversations</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onRefresh}
            title="Refresh"
          >
            <RotateCcwIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setIsCreating(true);
              setNewTitle("");
            }}
            title="New conversation"
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Inline create input */}
      {isCreating && (
        <div className="border-b p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreate();
            }}
            className="flex flex-col gap-2"
          >
            <Input
              ref={inputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Conversation title..."
              className="h-7 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsCreating(false);
                  setNewTitle("");
                }
              }}
            />
            <div className="flex gap-1.5">
              <Button size="xs" type="submit" disabled={!newTitle.trim()}>
                Create
              </Button>
              <Button
                size="xs"
                variant="ghost"
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewTitle("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="px-4 py-2">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && conversations.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-xs text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && conversations.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <MessageSquareTextIcon className="mb-2 size-8 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">No conversations yet</p>
        </div>
      )}

      {/* Conversation list */}
      {conversations.length > 0 && (
        <ScrollArea className="flex-1">
          <div className="py-1">
            {sorted.map((conv) => (
              <div key={conv.id} className="group relative px-2 py-0.5">
                {renamingId === conv.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRenameSubmit(conv.id);
                    }}
                    className="px-2 py-1"
                  >
                    <Input
                      ref={renameInputRef}
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="h-7 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setRenamingId(null);
                        }
                      }}
                      onBlur={() => handleRenameSubmit(conv.id)}
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => onSelect(conv.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                      selectedId === conv.id
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <MessageSquareTextIcon className="size-3.5 shrink-0" />
                    <span className="flex-1 truncate">
                      {conv.title || "Untitled"}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground/60">
                      {conv.messageCount}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className={cn(
                          "flex size-5 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted-foreground/10",
                          selectedId === conv.id && "opacity-100"
                        )}
                      >
                        <MoreHorizontalIcon className="size-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={4}>
                        <DropdownMenuItem
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setRenamingId(conv.id);
                            setRenameValue(conv.title ?? "");
                          }}
                        >
                          <PencilIcon className="size-3.5" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onDelete(conv.id);
                          }}
                        >
                          <Trash2Icon className="size-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

