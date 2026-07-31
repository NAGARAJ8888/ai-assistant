"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const embedding_service_1 = require("../services/embedding.service");
async function main() {
    const embedding = await embedding_service_1.EmbeddingService.createEmbedding("Hello World");
    //console.log("Dimension:", embedding.length);
}
main().catch(console.error);
