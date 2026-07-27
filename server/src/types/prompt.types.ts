export interface PromptInput {
  question: string;
  chunks: {
    content: string;
    page: number;
  }[];
}

export interface PromptResult {
  prompt: string;
  contextSize: number;
  chunkCount: number;
}

export interface ChatResponse {
  conversationId: string;
  messageId: string;
  answer: string;
  chunkCount: number;
  retrievalTimeMs: number;
  aiGenerationTimeMs: number;
  totalExecutionTimeMs: number;
}

