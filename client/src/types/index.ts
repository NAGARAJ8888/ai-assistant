// ===== API Response Wrappers =====

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ===== User =====

export interface User {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  createdAt: string;
}

// ===== Conversation =====

export interface ConversationSummary {
  id: string;
  title: string | null;
  lastMessageAt: string | null;
  updatedAt: string;
  messageCount: number;
}

export interface MessageSource {
  documentId: string;
  chunkId: string;
  page: number;
  similarity: number;
}

export interface Message {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  sources: MessageSource[] | null;
  createdAt: string;
  conversationId: string;
}

export interface ConversationDetail {
  id: string;
  title: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  messages: Message[];
}

// ===== Chat =====

export interface ChatResponse {
  conversationId: string;
  messageId: string;
  answer: string;
  chunkCount: number;
  retrievalTimeMs: number;
  aiGenerationTimeMs: number;
  totalExecutionTimeMs: number;
}

// ===== Document =====

export interface Document {
  id: string;
  title: string;
  storagePath: string;
  status: "PROCESSING" | "READY" | "FAILED";
  pageCount: number | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

