import { ConversationRepository } from "../repositories/conversation.repository";
import { MessageRepository } from "../repositories/message.repository";

export class ConversationService {
  static async create(userId: string, question: string) {
    // Auto-generate title from the first question, limit to ~60 chars
    const title = question.length > 60
      ? question.substring(0, 57) + "..."
      : question;

    const conversation = await ConversationRepository.create({
      title,
      userId,
    });

    //console.log(`[Conversation] Created: id=${conversation.id}, title="${title}", userId=${userId}`);

    return conversation;
  }

  static async getById(id: string, userId: string) {
    const conversation = await ConversationRepository.findById(id);

    if (!conversation) {
      return null;
    }

    // Ensure the conversation belongs to the requesting user
    if (conversation.userId !== userId) {
      return null;
    }

    const messages = await MessageRepository.findByConversation(id);

    return {
      ...conversation,
      messages,
    };
  }

  static async getByUser(userId: string) {
    const conversations = await ConversationRepository.findByUser(userId);

    // Attach message counts
    const result = await Promise.all(
      conversations.map(async (conv) => {
        const messages = await MessageRepository.findByConversation(conv.id);
        return {
          id: conv.id,
          title: conv.title,
          lastMessageAt: conv.lastMessageAt,
          updatedAt: conv.updatedAt,
          messageCount: messages.length,
        };
      })
    );

    return result;
  }

  static async rename(id: string, userId: string, title: string) {
    const conversation = await ConversationRepository.findById(id);

    if (!conversation) {
      return null;
    }

    if (conversation.userId !== userId) {
      return null;
    }

    const updated = await ConversationRepository.updateTitle(id, title);

    //console.log(`[Conversation] Renamed: id=${id}, title="${title}", userId=${userId}`);

    return updated;
  }

  static async delete(id: string, userId: string) {
    const conversation = await ConversationRepository.findById(id);

    if (!conversation) {
      return false;
    }

    if (conversation.userId !== userId) {
      return false;
    }

    await ConversationRepository.delete(id);

    //console.log(`[Conversation] Deleted: id=${id}, userId=${userId}`);

    return true;
  }
}

