import "dotenv/config";
import { RetrievalService } from "../services/retrieval.service";

async function main() {
  const result = await RetrievalService.retrieve("What is this document about?", 3);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
