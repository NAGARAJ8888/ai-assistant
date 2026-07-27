import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export class ChunkService {
  static async split(text: string) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    return splitter.createDocuments([text]);
  }
}