"use client";

import { useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "./../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./../../../../components/ui/card";
import { Badge } from "./../../../../components/ui/badge";
import {
  UploadIcon,
  FileTextIcon,
  Loader2Icon,
  CheckCircle2Icon,
  AlertCircleIcon,
  XCircleIcon,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
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
        </CardContent>
      </Card>

      {/* Recent uploads */}
      {recentUploads.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold">Recent Uploads</h2>
          <div className="space-y-2">
            {recentUploads.map((doc) => {
              const config = statusConfig[doc.status];
              const StatusIcon = config.icon;
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
                    <Badge variant={config.variant}>
                      <StatusIcon
                        className={`size-3 ${
                          doc.status === "PROCESSING" ? "animate-spin" : ""
                        }`}
                      />
                      <span className="ml-1">{config.label}</span>
                    </Badge>
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
  );
}

