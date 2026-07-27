import gemini from "../lib/gemini";

export class AIService {
  static async generate(prompt: string): Promise<string> {
    const response = await gemini.models.generateContent({
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

