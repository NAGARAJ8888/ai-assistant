"use client";

import { useState, useCallback, useEffect } from "react";
import { ConversationSidebar } from "@/components/conversation/conversation-sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { useConversations } from "@/hooks/use-conversations";
import { useChat } from "@/hooks/use-chat";

export default function DashboardPage() {
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

  // Load messages when a conversation is selected
  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
    } else {
      clearMessages();
    }
  }, [selectedId, fetchMessages, clearMessages]);

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? prev : id));
  }, []);

  const handleCreate = useCallback(
    async (title: string) => {
      const conv = await createConversation(title);
      // createConversation returns the full detail with messages — we navigate to it
      // But the hook now returns ConversationDetail | null, and we need its id
      // We'll refetch conversations after creation
      if (conv) {
        setSelectedId(conv.id);
        fetchMessages(conv.id);
      }
    },
    [createConversation, fetchMessages]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteConversation(id);
      if (selectedId === id) {
        setSelectedId(null);
        clearMessages();
      }
    },
    [deleteConversation, selectedId, clearMessages]
  );

  const handleSendMessage = useCallback(
    async (question: string) => {
      if (!selectedId) return;
      const newConversationId = await sendMessage(question, selectedId);
      // If the chat service created a new conversation (no conversationId was provided),
      // update the selected id and refresh list
      if (newConversationId && newConversationId !== selectedId) {
        setSelectedId(newConversationId);
        fetchConversations();
      } else {
        // Just refresh the conversation list to update timestamps/counts
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

  return (
    <div className="flex min-h-0 flex-1">
      {/* Left sidebar — conversations */}
      <div className="w-72 shrink-0 border-r">
        <ConversationSidebar
          conversations={conversations}
          selectedId={selectedId}
          loading={convsLoading}
          error={convsError}
          onSelect={handleSelect}
          onCreate={handleCreate}
          onRename={renameConversation}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Right area — chat interface */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ChatInterface
          messages={messages}
          loading={msgsLoading}
          sending={sending}
          error={chatError}
          selectedConversationId={selectedId}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}

