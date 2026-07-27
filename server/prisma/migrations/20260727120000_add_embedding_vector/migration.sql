-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to Chunk table
ALTER TABLE "Chunk" ADD COLUMN "embedding" vector(3072);

