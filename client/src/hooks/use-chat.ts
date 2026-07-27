"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import type { Message } from "@/types";
import * as api from "@/lib/api";

export function useChat() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(
    async (conversationId: string) => {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        if (!token) return;
        const data = await api.getMessages(token, conversationId);
        setMessages(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load messages";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  const sendMessage = useCallback(
    async (
      question: string,
      conversationId?: string
    ): Promise<string | null> => {
      try {
        setSending(true);
        setError(null);
        const token = await getToken();
        if (!token) return null;

        // Optimistically add user message
        const userMsg: Message = {
          id: `temp-${Date.now()}`,
          role: "USER",
          content: question,
          sources: null,
          createdAt: new Date().toISOString(),
          conversationId: conversationId ?? "",
        };
        setMessages((prev) => [...prev, userMsg]);

        const response = await api.askQuestion(token, question, conversationId);

        // Add assistant response
        const assistantMsg: Message = {
          id: response.messageId,
          role: "ASSISTANT",
          content: response.answer,
          sources: null,
          createdAt: new Date().toISOString(),
          conversationId: response.conversationId,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        return response.conversationId;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to send message";
        setError(msg);
        return null;
      } finally {
        setSending(false);
      }
    },
    [getToken]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    sending,
    error,
    fetchMessages,
    sendMessage,
    clearMessages,
  };
}

