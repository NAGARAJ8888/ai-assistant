import { PromptInput, PromptResult } from "../types/prompt.types";

const SYSTEM_INSTRUCTIONS = `You are a knowledgeable AI assistant that answers questions based strictly on the provided document context.

## Rules

1. Answer ONLY using the information present in the "Retrieved Context" section below.
2. If the context does not contain enough information to answer the question, clearly state: "I cannot answer this based on the uploaded documents."
3. Do NOT make up facts, guesses, or inferences that are not explicitly supported by the context.
4. Keep responses concise but complete — cover all relevant information from the context.
5. Preserve formatting (lists, code blocks, tables, etc.) where appropriate.
6. Cite the source page number(s) when referencing specific information.
7. If the question is ambiguous, ask clarifying questions rather than assuming intent.`;

export class PromptBuilderService {
  static build(input: PromptInput): PromptResult {
    const { question, chunks } = input;

    // Build context section with numbered entries and page references
    const contextLines = chunks.map((chunk, index) => {
      const header = `[${index + 1}] (Page ${chunk.page})`;
      return `${header}\n${chunk.content}`;
    });

    const contextSection = contextLines.join("\n\n---\n\n");

    const prompt = `${SYSTEM_INSTRUCTIONS}

## Retrieved Context

${contextSection}

## Question

${question}

## Answer`;

    const contextSize = Buffer.byteLength(contextSection, "utf-8");
    const chunkCount = chunks.length;

    console.log(
      `[PromptBuilder] Built prompt: ${chunkCount} chunk(s), ${contextSize} bytes of context`
    );

    return {
      prompt,
      contextSize,
      chunkCount,
    };
  }
}

