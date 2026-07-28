"use client";

import { useCallback } from "react";
import { ConversationSidebar } from "@/components/conversation/conversation-sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Button } from "@/components/ui/button";
import { useDashboard } from "../dashboard-context";
import { MessageSquareTextIcon } from "lucide-react";

export default function DashboardPage() {
  const {
    conversations,
    selectedId,
    convsLoading,
    convsError,
    onSelect,
    onCreate,
    onRename,
    onDelete,
    onRefresh,
    messages,
    msgsLoading,
    sending,
    chatError,
    onSendMessage,
    setMobileDrawerOpen,
  } = useDashboard();

  const handleSendMessage = useCallback(
    async (question: string) => {
      if (!selectedId) return;
      await onSendMessage(question);
    },
    [selectedId, onSendMessage]
  );

  // Wrapper to match ConversationSidebar's expected void return type
  const handleCreate = useCallback(
    async (title: string) => {
      await onCreate(title);
    },
    [onCreate]
  );

  return (
    <div className="flex min-h-0 flex-1">
      {/* Left sidebar — conversations (desktop only) */}
      <div className="hidden shrink-0 border-r bg-background md:flex">
        <ConversationSidebar
          conversations={conversations}
          selectedId={selectedId}
          loading={convsLoading}
          error={convsError}
          onSelect={onSelect}
          onCreate={handleCreate}
          onRename={onRename}
          onDelete={onDelete}
          onRefresh={onRefresh}
        />
      </div>

      {/* Right area — chat interface */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Mobile: prompt to select a conversation when none is selected */}
        {!selectedId && (
          <div className="flex items-center justify-center border-b px-4 py-2 md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileDrawerOpen(true)}
              className="w-full gap-2"
            >
              <MessageSquareTextIcon className="size-4" />
              Select a conversation
            </Button>
          </div>
        )}
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

