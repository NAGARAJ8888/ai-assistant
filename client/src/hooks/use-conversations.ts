"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import type { ConversationSummary, ConversationDetail } from "@/types";
import * as api from "@/lib/api";

export function useConversations() {
  const { getToken } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const getTokenRef = useRef(getToken);

  // Keep the ref current without causing effect re-runs
  getTokenRef.current = getToken;

  // Initial data load — called once on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const token = await getTokenRef.current();
        if (!token || cancelled) return;
        const data = await api.getConversations(token);
        if (!cancelled) {
          setConversations(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg =
            err instanceof Error
              ? err.message
              : "Failed to load conversations";
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []); // empty deps — runs exactly once on mount

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) return;
      const data = await api.getConversations(token);
      setConversations(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load conversations";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const create = useCallback(
    async (title: string): Promise<ConversationDetail | null> => {
      try {
        setError(null);
        const token = await getToken();
        if (!token) return null;
        const conv = await api.createConversation(token, title);
        setConversations((prev) => [
          {
            id: conv.id,
            title: conv.title,
            lastMessageAt: conv.lastMessageAt,
            updatedAt: conv.updatedAt,
            messageCount: 0,
          },
          ...prev,
        ]);
        return conv;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create conversation";
        setError(msg);
        return null;
      }
    },
    [getToken]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        setError(null);
        const token = await getToken();
        if (!token) return;
        await api.deleteConversation(token, id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete conversation";
        setError(msg);
      }
    },
    [getToken]
  );

  const rename = useCallback(
    async (id: string, title: string) => {
      try {
        setError(null);
        const token = await getToken();
        if (!token) return;
        await api.renameConversation(token, id, title);
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title } : c))
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to rename conversation";
        setError(msg);
      }
    },
    [getToken]
  );

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    create,
    remove,
    rename,
  };
}

