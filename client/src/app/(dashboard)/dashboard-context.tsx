"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useConversations } from "@/hooks/use-conversations";
import { useChat } from "@/hooks/use-chat";
import type { ConversationSummary, ConversationDetail, Message } from "@/types";

interface DashboardContextValue {
  // Conversations
  conversations: ConversationSummary[];
  selectedId: string | null;
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
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
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

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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
    },
    []
  );

  const handleCreate = useCallback(
    async (title: string) => {
      const conv = await createConversation(title);
      if (conv) {
        setSelectedId(conv.id);
        fetchMessages(conv.id);
        setMobileDrawerOpen(false);
      }
      return conv;
    },
    [createConversation, fetchMessages]
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
      if (newConversationId && newConversationId !== selectedId) {
        setSelectedId(newConversationId);
        fetchConversations();
      } else {
        fetchConversations();
      }
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
      }}
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

