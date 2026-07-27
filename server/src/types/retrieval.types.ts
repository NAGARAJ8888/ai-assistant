export interface RetrievedChunk {
  id: string;
  documentId: string;
  content: string;
  page: number;
  similarity: number;
}

export interface RetrievalResult {
  question: string;
  chunks: RetrievedChunk[];
  executionTimeMs: number;
  totalChunks: number;
}

