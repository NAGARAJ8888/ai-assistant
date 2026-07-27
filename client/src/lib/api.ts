import type {
  ApiResponse,
  User,
  ConversationSummary,
  ConversationDetail,
  Message,
  ChatResponse,
  Document,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

/**
 * Low-level fetch wrapper with auth token and JSON parsing.
 */
export async function apiFetch<T>(
  endpoint: string,
  token?: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Only set Content-Type for non-FormData bodies
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json().catch(() => ({
    success: false as const,
    message: "Failed to parse server response",
  }));

  if (!response.ok || !data.success) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data.data;
}

// ===== User =====

export async function getMe(token: string): Promise<User> {
  return apiFetch<User>("/api/users/me", token);
}

// ===== Conversations =====

export async function getConversations(
  token: string
): Promise<ConversationSummary[]> {
  return apiFetch<ConversationSummary[]>("/api/conversations", token);
}

export async function getConversation(
  token: string,
  id: string
): Promise<ConversationDetail> {
  return apiFetch<ConversationDetail>(`/api/conversations/${id}`, token);
}

export async function createConversation(
  token: string,
  title: string
): Promise<ConversationDetail> {
  return apiFetch<ConversationDetail>("/api/conversations", token, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function renameConversation(
  token: string,
  id: string,
  title: string
): Promise<ConversationDetail> {
  return apiFetch<ConversationDetail>(`/api/conversations/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
}

export async function deleteConversation(
  token: string,
  id: string
): Promise<void> {
  await apiFetch<void>(`/api/conversations/${id}`, token, {
    method: "DELETE",
  });
}

// ===== Messages =====

export async function getMessages(
  token: string,
  conversationId: string
): Promise<Message[]> {
  return apiFetch<Message[]>(
    `/api/conversations/${conversationId}/messages`,
    token
  );
}

// ===== Chat =====

export async function askQuestion(
  token: string,
  question: string,
  conversationId?: string
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>("/api/chat/ask", token, {
    method: "POST",
    body: JSON.stringify({ question, conversationId }),
  });
}

// ===== Documents =====

export async function uploadDocument(
  token: string,
  file: File
): Promise<Document> {
  const formData = new FormData();
  formData.append("document", file);

  return apiFetch<Document>("/api/documents/upload", token, {
    method: "POST",
    body: formData,
  });
}

export async function getDocuments(
  token: string
): Promise<Document[]> {
  return apiFetch<Document[]>("/api/documents", token);
}

export async function getDocument(
  token: string,
  id: string
): Promise<Document> {
  return apiFetch<Document>(`/api/documents/${id}`, token);
}

