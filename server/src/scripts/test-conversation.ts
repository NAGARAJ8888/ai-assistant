import "dotenv/config";
import { ConversationService } from "../services/conversation.service";
import { MessageService } from "../services/message.service";

async function main() {
  const userId = process.argv[2];

  if (!userId) {
    console.error("Usage: npx tsx src/scripts/test-conversation.ts <userId>");
    console.error("Provide a valid Clerk user ID from your database.");
    process.exit(1);
  }

  console.log("=".repeat(60));
  console.log("Conversation Persistence Test");
  console.log("=".repeat(60));
  console.log(`User ID: ${userId}`);
  console.log("");

  try {
    // 1. Create a conversation
    console.log("--- Test 1: Create Conversation ---");
    const question = "What were the total sales for Q3?";
    const conversation = await ConversationService.create(userId, question);
    console.log(`  ✓ Conversation created:`);
    console.log(`    id:    ${conversation.id}`);
    console.log(`    title: ${conversation.title}`);
    console.log(`    userId: ${conversation.userId}`);

    if (!conversation.id) {
      throw new Error("Conversation creation failed: no id returned");
    }
    console.log("");

    // 2. Save a user message
    console.log("--- Test 2: Save User Message ---");
    const userMsg = await MessageService.saveUserMessage(
      conversation.id,
      question
    );
    console.log(`  ✓ User message saved:`);
    console.log(`    id:      ${userMsg.id}`);
    console.log(`    role:    ${userMsg.role}`);
    console.log(`    content: ${userMsg.content}`);

    if (userMsg.role !== "USER") {
      throw new Error(`Expected role USER, got ${userMsg.role}`);
    }
    console.log("");

    // 3. Save an assistant message
    console.log("--- Test 3: Save Assistant Message ---");
    const answer =
      "Based on the uploaded documents, total sales for Q3 were $2.4 million, representing a 15% increase year-over-year.";
    const sources = [
      {
        documentId: "test-doc-1",
        chunkId: "test-chunk-1",
        page: 3,
        similarity: 0.92,
      },
      {
        documentId: "test-doc-1",
        chunkId: "test-chunk-2",
        page: 4,
        similarity: 0.85,
      },
    ];

    const assistantMsg = await MessageService.saveAssistantMessage(
      conversation.id,
      answer,
      sources
    );
    console.log(`  ✓ Assistant message saved:`);
    console.log(`    id:      ${assistantMsg.id}`);
    console.log(`    role:    ${assistantMsg.role}`);
    console.log(`    content: ${assistantMsg.content}`);
    if (assistantMsg.sources) {
      console.log(`    sources: ${JSON.stringify(assistantMsg.sources)}`);
    }

    if (assistantMsg.role !== "ASSISTANT") {
      throw new Error(`Expected role ASSISTANT, got ${assistantMsg.role}`);
    }
    console.log("");

    // 4. Retrieve conversation with messages
    console.log("--- Test 4: Retrieve Conversation ---");
    const retrieved = await ConversationService.getById(
      conversation.id,
      userId
    );
    if (!retrieved) {
      throw new Error("Conversation not found after creation");
    }
    console.log(`  ✓ Conversation retrieved:`);
    console.log(`    id:       ${retrieved.id}`);
    console.log(`    title:    ${retrieved.title}`);
    if (retrieved.lastMessageAt) {
      console.log(`    lastMsg:  ${retrieved.lastMessageAt}`);
    }
    console.log(`    messages: ${retrieved.messages.length}`);

    if (retrieved.messages.length !== 2) {
      throw new Error(
        `Expected 2 messages, got ${retrieved.messages.length}`
      );
    }
    // Verify order: USER first, then ASSISTANT
    const [firstMsg, secondMsg] = retrieved.messages;
    if (firstMsg.role !== "USER" || secondMsg.role !== "ASSISTANT") {
      throw new Error("Messages not in correct order (USER -> ASSISTANT)");
    }
    console.log(`  ✓ Message order verified: USER -> ASSISTANT`);
    console.log("");

    // 5. Retrieve message history
    console.log("--- Test 5: Retrieve Message History ---");
    const messages = await MessageService.getMessageHistory(
      conversation.id,
      userId
    );
    if (!messages) {
      throw new Error("Message history returned null");
    }
    console.log(`  ✓ Message history retrieved:`);
    console.log(`    count: ${messages.length}`);
    messages.forEach((msg, idx) => {
      console.log(`    [${idx}] ${msg.role}: ${msg.content.substring(0, 60)}...`);
    });

    if (messages.length !== 2) {
      throw new Error(`Expected 2 messages in history, got ${messages.length}`);
    }
    console.log("");

    // 6. Get all conversations for user
    console.log("--- Test 6: List User Conversations ---");
    const userConversations = await ConversationService.getByUser(userId);
    console.log(`  ✓ User has ${userConversations.length} conversation(s):`);
    userConversations.forEach((conv) => {
      console.log(`    - ${conv.title} (${conv.messageCount} messages)`);
    });

    if (userConversations.length < 1) {
      throw new Error("Expected at least 1 conversation for user");
    }
    console.log("");

    // 7. Delete conversation and verify cascade
    console.log("--- Test 7: Delete Conversation ---");
    const deleted = await ConversationService.delete(conversation.id, userId);
    if (!deleted) {
      throw new Error("Conversation deletion returned false");
    }
    console.log(`  ✓ Conversation deleted: ${conversation.id}`);

    // Verify conversation no longer exists
    const afterDelete = await ConversationService.getById(
      conversation.id,
      userId
    );
    if (afterDelete !== null) {
      throw new Error("Conversation still exists after deletion");
    }
    console.log(`  ✓ Conversation confirmed deleted`);

    // Verify messages were cascaded
    const afterDeleteMessages = await MessageService.getMessageHistory(
      conversation.id,
      userId
    );
    if (afterDeleteMessages !== null) {
      throw new Error("Messages still exist after conversation deletion");
    }
    console.log(`  ✓ Messages confirmed cascaded deleted`);
    console.log("");

    console.log("=".repeat(60));
    console.log("ALL TESTS PASSED ✓");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("");
    console.error("TEST FAILED:", error);
    process.exit(1);
  }
}

main();

