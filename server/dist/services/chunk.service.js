"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChunkService = void 0;
const textsplitters_1 = require("@langchain/textsplitters");
class ChunkService {
    static async split(text) {
        const splitter = new textsplitters_1.RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        return splitter.createDocuments([text]);
    }
}
exports.ChunkService = ChunkService;
