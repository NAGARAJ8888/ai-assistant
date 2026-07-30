"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const supabase_1 = __importDefault(require("../lib/supabase"));
class StorageService {
    static async uploadPDF(userId, file) {
        const fileName = `${Date.now()}_${file.originalname}`;
        const filePath = `${userId}/${fileName}`;
        const { error } = await supabase_1.default.storage
            .from("documents")
            .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        if (error) {
            throw new Error(error.message);
        }
        return {
            bucket: "documents",
            path: filePath,
            fileName,
        };
    }
    static async deletePDF(path) {
        const { error } = await supabase_1.default.storage
            .from("documents")
            .remove([path]);
        if (error) {
            console.error(`Failed to delete PDF from storage at path "${path}":`, error.message);
        }
    }
}
exports.StorageService = StorageService;
