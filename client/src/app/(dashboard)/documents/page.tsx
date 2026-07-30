"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  UploadIcon,
  FileTextIcon,
  Loader2Icon,
  CheckCircle2Icon,
  AlertCircleIcon,
  XCircleIcon,
  MoreVerticalIcon,
  Trash2Icon,
} from "lucide-react";
import * as api from "@/lib/api";
import type { Document } from "@/types";

const statusConfig = {
  PROCESSING: {
    label: "Processing",
    icon: Loader2Icon,
    variant: "outline" as const,
  },
  READY: {
    label: "Ready",
    icon: CheckCircle2Icon,
    variant: "secondary" as const,
  },
  FAILED: {
    label: "Failed",
    icon: XCircleIcon,
    variant: "destructive" as const,
  },
};

export default function DocumentsPage() {
  const { getToken } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedDoc, setUploadedDoc] = useState<Document | null>(null);
  const [recentUploads, setRecentUploads] = useState<Document[]>([]);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  // Keep a ref to the latest recentUploads so polling always has fresh data
  const recentUploadsRef = useRef(recentUploads);
  recentUploadsRef.current = recentUploads;

  // Load existing documents on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const token = await getTokenRef.current();
      if (!token || cancelled) return;
      try {
        const docs = await api.getDocuments(token);
        if (!cancelled) {
          setRecentUploads(docs);
        }
      } catch {
        // Silently fail — user can manually upload
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // Poll documents that are still PROCESSING
  const pollProcessing = useCallback(async () => {
    const currentUploads = recentUploadsRef.current;
    const processingIds = currentUploads
      .filter((d) => d.status === "PROCESSING")
      .map((d) => d.id);
    if (processingIds.length === 0) return;

    const token = await getTokenRef.current();
    if (!token) return;

    const updated = await Promise.all(
      processingIds.map(async (id) => {
        try {
          const doc = await api.getDocument(token, id);
          return doc;
        } catch {
          return null;
        }
      })
    );

    const settled = updated.filter(Boolean) as Document[];

    setRecentUploads((prev) => {
      const next = prev.map((doc) => {
        const match = settled.find((u) => u.id === doc.id);
        if (match && (match.status !== doc.status || match.pageCount !== doc.pageCount)) {
          return match;
        }
        return doc;
      });
      // Bail out if nothing changed to avoid re-render loops
      if (next.every((doc, i) => doc === prev[i])) {
        return prev;
      }
      return next;
    });
  }, []); // stable — reads via refs

  // Poll every 2 seconds while any document is PROCESSING
  useEffect(() => {
    const hasProcessing = recentUploads.some(
      (d) => d.status === "PROCESSING"
    );
    if (!hasProcessing) return;

    const interval = setInterval(pollProcessing, 2000);
    return () => clearInterval(interval);
  }, [recentUploads, pollProcessing]);

  // Also update uploadedDoc when it changes to READY/FAILED
  useEffect(() => {
    if (uploadedDoc) {
      const match = recentUploads.find((d) => d.id === uploadedDoc.id);
      if (match && match.status !== uploadedDoc.status) {
        setUploadedDoc(match);
      }
    }
  }, [recentUploads, uploadedDoc]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setUploadError(null);
    setUploadedDoc(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select a PDF file to upload.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Only PDF files are supported.");
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      setUploadedDoc(null);

      const token = await getToken();
      if (!token) {
        setUploadError("Authentication required. Please sign in.");
        return;
      }

      const doc = await api.uploadDocument(token, file);
      setUploadedDoc(doc);
      setRecentUploads((prev) => [doc, ...prev]);
      setFile(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to upload document.";
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!docToDelete) return;

    const docId = docToDelete.id;

    try {
      setDeletingDocId(docId);
      setDeleteError(null);
      setDeleteSuccess(null);

      const token = await getToken();
      if (!token) {
        setDeleteError("Authentication required. Please sign in.");
        return;
      }

      await api.deleteDocument(token, docId);

      // Remove the document from the UI immediately
      setRecentUploads((prev) => prev.filter((d) => d.id !== docId));

      // Clear success message after 3 seconds
      setDeleteSuccess(`"${docToDelete.title}" deleted successfully.`);
      setTimeout(() => setDeleteSuccess(null), 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete document.";
      setDeleteError(msg);
    } finally {
      setDeletingDocId(null);
      setDocToDelete(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Fixed top section: Title + Upload */}
      <div className="shrink-0 px-6 pb-0 pt-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Upload Documents</h1>
            <p className="text-sm text-muted-foreground">
              Upload PDF documents to build your knowledge base. Documents are
              automatically processed and indexed for AI-powered search.
            </p>
          </div>

          {/* Upload card */}
          <Card>
            <CardHeader>
              <CardTitle>Upload a PDF</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File selection */}
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-foreground file:mr-3 file:h-8 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-3 file:text-xs file:font-medium file:text-primary-foreground file:hover:bg-primary/80"
                  disabled={uploading}
                />
              </div>

              {/* Selected file info */}
              {file && (
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                  <FileTextIcon className="size-4 text-muted-foreground" />
                  <span className="flex-1 truncate text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              )}

              {/* Upload button */}
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Uploading & Processing...
                  </>
                ) : (
                  <>
                    <UploadIcon className="size-4" />
                    Upload
                  </>
                )}
              </Button>

              {/* Upload error */}
              {uploadError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircleIcon className="size-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Upload success */}
              {uploadedDoc && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
                  <CheckCircle2Icon className="size-4 shrink-0" />
                  <span>
                    Uploaded <strong>{uploadedDoc.title}</strong> successfully.
                    {uploadedDoc.status === "PROCESSING" &&
                      " Processing has started in the background."}
                  </span>
                </div>
              )}

              {/* Delete success message */}
              {deleteSuccess && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
                  <CheckCircle2Icon className="size-4 shrink-0" />
                  <span>{deleteSuccess}</span>
                </div>
              )}

              {/* Delete error message */}
              {deleteError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircleIcon className="size-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scrollable bottom section: Recent uploads or Empty state */}
      <ScrollArea className="flex-1 px-6 pb-6">
        <div className="mx-auto max-w-2xl">
          {recentUploads.length > 0 && (
            <div>
              <h2 className="my-3 text-sm font-semibold">Recent Uploads</h2>
              <div className="space-y-2">
                {recentUploads.map((doc) => {
                  const config = statusConfig[doc.status];
                  const StatusIcon = config.icon;
                  const isDeleting = deletingDocId === doc.id;
                  return (
                    <Card key={doc.id} size="sm">
                      <CardContent className="flex items-center gap-3 py-3">
                        <FileTextIcon className="size-5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">
                            {doc.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.createdAt).toLocaleDateString()}
                            {doc.pageCount != null && ` · ${doc.pageCount} pages`}
                          </p>
                        </div>
                        <Badge>
                          <StatusIcon
                            className={`size-3 ${
                              doc.status === "PROCESSING" ? "animate-spin" : ""
                            }`}
                          />
                          <span className="ml-1">{config.label}</span>
                        </Badge>

{/* Document actions dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              disabled={isDeleting}
                              className="shrink-0"
                            >
                              {isDeleting ? (
                                <Loader2Icon className="size-4 animate-spin" />
                              ) : (
                                <MoreVerticalIcon className="size-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDocToDelete(doc)}
                              disabled={isDeleting}
                            >
                              <Trash2Icon className="size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {recentUploads.length === 0 && !uploadedDoc && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileTextIcon className="mb-3 size-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No documents uploaded yet.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Delete confirmation dialog */}
      <Dialog
        open={docToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setDocToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              <strong>{docToDelete?.title}</strong>? This action cannot be undone.
              The PDF, all text chunks, and vector embeddings will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDocToDelete(null)}
              disabled={deletingDocId !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletingDocId !== null}
            >
              {deletingDocId !== null ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2Icon className="size-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
