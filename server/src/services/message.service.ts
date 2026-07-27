import { MessageRole } from "@prisma/client";
import { ConversationRepository } from "../repositories/conversation.repository";
import { MessageRepository, SourceMetadata } from "../repositories/message.repository";

export class MessageService {
  static async saveUserMessage(conversationId: string, content: string) {
    const message = await MessageRepository.create({
      conversationId,
      role: MessageRole.USER,
      content,
    });

    // Update lastMessageAt timestamp on the conversation
    await ConversationRepository.updateLastMessageAt(conversationId);

    console.log(`[Message] User message saved: conversationId=${conversationId}, messageId=${message.id}`);

    return message;
  }

  static async saveAssistantMessage(
    conversationId: string,
    content: string,
    sources?: SourceMetadata[]
  ) {
    const message = await MessageRepository.create({
      conversationId,
      role: MessageRole.ASSISTANT,
      content,
      sources,
    });

    // Update lastMessageAt timestamp on the conversation
    await ConversationRepository.updateLastMessageAt(conversationId);

    console.log(`[Message] Assistant message saved: conversationId=${conversationId}, messageId=${message.id}`);

    return message;
  }

  static async getMessageHistory(conversationId: string, userId: string) {
    const conversation = await ConversationRepository.findById(conversationId);

    if (!conversation) {
      return null;
    }

    if (conversation.userId !== userId) {
      return null;
    }

    const messages = await MessageRepository.findByConversation(conversationId);

    console.log(`[Message] History retrieved: conversationId=${conversationId}, count=${messages.length}, userId=${userId}`);

    return messages;
  }
}

