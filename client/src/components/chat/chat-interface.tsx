"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";
import {
  SendIcon,
  BotIcon,
  UserIcon,
  Loader2Icon,
  AlertCircleIcon,
  MessageSquareTextIcon,
} from "lucide-react";

interface ChatInterfaceProps {
  messages: Message[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  selectedConversationId: string | null;
  onSendMessage: (question: string) => Promise<void>;
}

export function ChatInterface({
  messages,
  loading,
  sending,
  error,
  selectedConversationId,
  onSendMessage,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        "[data-slot='scroll-area-viewport']",
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus textarea when conversation changes
  useEffect(() => {
    if (selectedConversationId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [selectedConversationId]);

  const handleSubmit = async () => {
    const question = input.trim();
    if (!question || sending) return;
    setInput("");
    await onSendMessage(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Loading bar when switching conversations — sits right below navbar border */}
      {loading && messages.length > 0 && (
        <div className="relative h-1 w-full shrink-0 overflow-hidden bg-muted/30">
          <div className="absolute inset-0 animate-loading-bar bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      )}

      {/* Messages area */}
      <ScrollArea ref={scrollRef} className="min-h-0 flex-1">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4">

          {/* No conversation selected */}
          {!selectedConversationId && !loading && (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <BotIcon className="mb-4 size-12 text-muted-foreground/40" />
              <h3 className="mb-1 text-lg font-medium text-foreground">
                AI Knowledge Assistant
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Select a conversation or create a new one to start asking
                questions about your documents.
              </p>
            </div>
          )}

          {/* Conversation selected but no messages yet — ready to start */}
          {selectedConversationId && !loading && messages.length === 0 && !sending && (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <MessageSquareTextIcon className="mb-4 size-12 text-muted-foreground/40" />
              <h3 className="mb-1 text-lg font-medium text-foreground">
                Start a conversation
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Send your first message to start chatting with the AI
                Knowledge Assistant.
              </p>
            </div>
          )}

          {/* Loading messages (initial load, no messages yet) */}
          {loading && messages.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2 sm:gap-3",
                msg.role === "USER" ? "justify-end" : "justify-start",
              )}
            >
              {msg.role === "ASSISTANT" && (
                <div className="flex size-7 shrink-0 items-center justify-center self-end rounded-full bg-primary text-primary-foreground sm:size-8">
                  <BotIcon className="size-3 sm:size-4" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed sm:max-w-[80%] sm:px-4 sm:py-2.5",
                  msg.role === "USER"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm",
                )}
              >
                <p className="break-words whitespace-pre-wrap [overflow-wrap:anywhere]">
                  {msg.content}
                </p>
                <p className="mt-1 text-[10px] opacity-50">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {msg.role === "USER" && (
                <div className="flex size-7 shrink-0 items-center self-end justify-center rounded-full bg-secondary text-secondary-foreground sm:size-8">
                  <UserIcon className="size-3 sm:size-4" />
                </div>
              )}
            </div>
          ))}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertCircleIcon className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t p-3 sm:p-4">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedConversationId
                  ? "Ask a question... (Shift+Enter for new line)"
                  : "Select a conversation to start chatting"
              }
              disabled={!selectedConversationId || sending}
              className="min-h-10 max-h-32 resize-none text-sm"
              rows={1}
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || sending || !selectedConversationId}
              size="icon"
              className="h-10 w-10 shrink-0 self-end"
            >
              {sending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <SendIcon className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
