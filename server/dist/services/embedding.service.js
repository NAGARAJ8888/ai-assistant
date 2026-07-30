"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingService = void 0;
const gemini_1 = __importDefault(require("../lib/gemini"));
class EmbeddingService {
    static async createEmbedding(text) {
        const response = await gemini_1.default.models.embedContent({
            model: "gemini-embedding-001",
            contents: text,
        });
        return response.embeddings?.[0]?.values ?? [];
    }
}
exports.EmbeddingService = EmbeddingService;
