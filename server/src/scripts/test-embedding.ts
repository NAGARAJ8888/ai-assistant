import "dotenv/config";
import gemini from "../lib/gemini";


async function main() {
  const response = await gemini.models.embedContent({
    model: "gemini-embedding-001",
    contents: "Hello World",
  });

  const embedding = response.embeddings?.[0]?.values;

  //console.log("Dimension:", embedding?.length);
}

main().catch(console.error);