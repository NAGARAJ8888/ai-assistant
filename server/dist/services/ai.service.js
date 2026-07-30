"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const gemini_1 = __importDefault(require("../lib/gemini"));
class AIService {
    static async generate(prompt) {
        const response = await gemini_1.default.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        const text = response.text;
        if (!text) {
            throw new Error("Gemini returned an empty response");
        }
        return text;
    }
}
exports.AIService = AIService;
