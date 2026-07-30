import supabase from "../lib/supabase";

export class StorageService {
  static async uploadPDF(
    userId: string,
    file: Express.Multer.File
  ) {
    const fileName = `${Date.now()}_${file.originalname}`;

    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage
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

  static async deletePDF(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from("documents")
      .remove([path]);

    if (error) {
      console.error(`Failed to delete PDF from storage at path "${path}":`, error.message);
    }
  }
}
