"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
class PdfService {
    static async extractText(file) {
        const data = await (0, pdf_parse_1.default)(file.buffer);
        return {
            text: data.text,
            pages: data.numpages,
            info: data.info,
        };
    }
}
exports.PdfService = PdfService;
