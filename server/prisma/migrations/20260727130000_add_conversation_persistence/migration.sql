-- AlterTable: Add lastMessageAt to Conversation
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "lastMessageAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: Add sources JSON field to Message
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "sources" JSONB;

