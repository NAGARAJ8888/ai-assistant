"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useConversations } from "@/hooks/use-conversations";
import { useChat } from "@/hooks/use-chat";
import type { ConversationSummary, ConversationDetail, Message, Document } from "@/types";
import * as api from "@/lib/api";

interface DashboardContextValue {
  // Conversations
  conversations: ConversationSummary[];
  selectedId: string | null;
  selectedTitle: string | null;
  convsLoading: boolean;
  convsError: string | null;
  onSelect: (id: string) => void;
  onCreate: (title: string) => Promise<ConversationDetail | null>;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
  // Messages
  messages: Message[];
  msgsLoading: boolean;
  sending: boolean;
  chatError: string | null;
  onSendMessage: (question: string) => Promise<void>;
  // Mobile UI
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  // Documents
  recentUploads: Document[];
  uploading: boolean;
  uploadError: string | null;
  uploadedDoc: Document | null;
  deleteSuccess: string | null;
  deleteError: string | null;
  onUploadDocument: (file: File) => Promise<void>;
  onDeleteDocument: (docId: string) => Promise<void>;
  onClearDeleteMessages: () => void;
  onClearUploadState: () => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    conversations,
    loading: convsLoading,
    error: convsError,
    fetchConversations,
    create: createConversation,
    remove: deleteConversation,
    rename: renameConversation,
  } = useConversations();

  const {
    messages,
    loading: msgsLoading,
    sending,
    error: chatError,
    fetchMessages,
    sendMessage,
    clearMessages,
  } = useChat();

  const { getToken } = useAuth();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // --- Document state (persists across tab switches) ---
  const [recentUploads, setRecentUploads] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedDoc, setUploadedDoc] = useState<Document | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  // Keep a ref to the latest recentUploads so polling always has fresh data
  const recentUploadsRef = useRef(recentUploads);
  recentUploadsRef.current = recentUploads;

  // Load existing documents on mount (once, when provider mounts)
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
        // Silently fail
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

  const handleUploadDocument = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Only PDF files are supported.");
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      setUploadedDoc(null);

      const token = await getTokenRef.current();
      if (!token) {
        setUploadError("Authentication required. Please sign in.");
        return;
      }

      const doc = await api.uploadDocument(token, file);
      setUploadedDoc(doc);
      setRecentUploads((prev) => [doc, ...prev]);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to upload document.";
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDeleteDocument = useCallback(async (docId: string) => {
    try {
      setDeleteError(null);
      setDeleteSuccess(null);

      const token = await getTokenRef.current();
      if (!token) {
        setDeleteError("Authentication required. Please sign in.");
        return;
      }

      await api.deleteDocument(token, docId);
      setRecentUploads((prev) => prev.filter((d) => d.id !== docId));
      setDeleteSuccess("Document deleted successfully.");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete document.";
      setDeleteError(msg);
    }
  }, []);

  const handleClearDeleteMessages = useCallback(() => {
    setDeleteSuccess(null);
    setDeleteError(null);
  }, []);

  const handleClearUploadState = useCallback(() => {
    setUploadError(null);
    setUploadedDoc(null);
  }, []);

  // Derive selectedTitle from conversations list when selectedId changes
  useEffect(() => {
    if (selectedId) {
      const conv = conversations.find((c) => c.id === selectedId);
      setSelectedTitle(conv?.title ?? null);
    } else {
      setSelectedTitle(null);
    }
  }, [selectedId, conversations]);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
    } else {
      clearMessages();
    }
  }, [selectedId, fetchMessages, clearMessages]);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId((prev) => (prev === id ? prev : id));
      setMobileDrawerOpen(false);
      // Navigate to dashboard so the chat page shows
      if (pathname !== "/dashboard") {
        router.push("/dashboard");
      }
    },
    [router, pathname]
  );

  const handleCreate = useCallback(
    async (title: string) => {
      const conv = await createConversation(title);
      if (conv) {
        setSelectedId(conv.id);
        fetchMessages(conv.id);
        setMobileDrawerOpen(false);
        // Navigate to dashboard so the chat page shows
        if (pathname !== "/dashboard") {
          router.push("/dashboard");
        }
      }
      return conv;
    },
    [createConversation, fetchMessages, router, pathname]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteConversation(id);
      setSelectedId((prev) => {
        if (prev === id) {
          clearMessages();
          return null;
        }
        return prev;
      });
    },
    [deleteConversation, clearMessages]
  );

  const handleSendMessage = useCallback(
    async (question: string) => {
      if (!selectedId) return;
      const newConversationId = await sendMessage(question, selectedId);
      // Only update selectedId if a new conversation was created.
      // We do NOT refetch messages here — the optimistic user message and
      // assistant response are already in state from sendMessage, and
      // refetching would replace them with the server snapshot (which
      // contains both messages at once), causing them to appear together.
      if (newConversationId && newConversationId !== selectedId) {
        setSelectedId(newConversationId);
      }
      fetchConversations();
    },
    [selectedId, sendMessage, fetchConversations]
  );

  const handleRefresh = useCallback(() => {
    fetchConversations();
    if (selectedId) {
      fetchMessages(selectedId);
    }
  }, [fetchConversations, fetchMessages, selectedId]);

  const handleRename = useCallback(
    async (id: string, title: string) => {
      await renameConversation(id, title);
      fetchConversations();
    },
    [renameConversation, fetchConversations]
  );

  return (
    <DashboardContext.Provider
      value={{
        conversations,
        selectedId,
        selectedTitle,
        convsLoading,
        convsError,
        onSelect: handleSelect,
        onCreate: handleCreate,
        onRename: handleRename,
        onDelete: handleDelete,
        onRefresh: handleRefresh,
        messages,
        msgsLoading,
        sending,
        chatError,
        onSendMessage: handleSendMessage,
        mobileDrawerOpen,
        setMobileDrawerOpen,
        recentUploads,
        uploading,
        uploadError,
        uploadedDoc,
        deleteSuccess,
        deleteError,
        onUploadDocument: handleUploadDocument,
        onDeleteDocument: handleDeleteDocument,
        onClearDeleteMessages: handleClearDeleteMessages,
        onClearUploadState: handleClearUploadState,
      } as DashboardContextValue}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return ctx;
}

