"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const gemini_1 = __importDefault(require("../lib/gemini"));
async function main() {
    const response = await gemini_1.default.models.embedContent({
        model: "gemini-embedding-001",
        contents: "Hello World",
    });
    const embedding = response.embeddings?.[0]?.values;
    //console.log("Dimension:", embedding?.length);
}
main().catch(console.error);
