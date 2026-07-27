import pdfParse from "pdf-parse";

export class PdfService {
  static async extractText(file: Express.Multer.File) {
    const data = await pdfParse(file.buffer);

    return {
      text: data.text,
      pages: data.numpages,
      info: data.info,
    };
  }
}
