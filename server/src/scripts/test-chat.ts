import "dotenv/config";
import { ChatService } from "../services/chat.service";

async function main() {
  const question = process.argv[2] || "What is this document about?";
  const userId = process.argv[3] || "test-user-id";

  console.log("=".repeat(60));
  console.log("RAG Chat Test");
  console.log("=".repeat(60));
  console.log(`Question: "${question}"`);
  console.log(`User ID: ${userId}`);
  console.log("");

  try {
    const response = await ChatService.ask(question, userId, undefined, 5);

    console.log("-".repeat(60));
    console.log("ANSWER:");
    console.log(response.answer);
    console.log("");
    console.log("-".repeat(60));
    console.log("METRICS:");
    console.log(`  Chunks retrieved:  ${response.chunkCount}`);
    console.log(`  Retrieval time:    ${response.retrievalTimeMs}ms`);
    console.log(`  AI generation time: ${response.aiGenerationTimeMs}ms`);
    console.log(`  Total time:         ${response.totalExecutionTimeMs}ms`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("Chat test failed:", error);
    process.exit(1);
  }
}

main();

