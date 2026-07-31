import "dotenv/config";
import { EmbeddingService } from "../services/embedding.service";

async function main() {
  const embedding = await EmbeddingService.createEmbedding("Hello World");
  //console.log("Dimension:", embedding.length);
}

main().catch(console.error);
