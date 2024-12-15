import formidable, { File } from "formidable";
import fs from "fs/promises";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false, // Matikan bodyParser bawaan Next.js untuk form-data
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const uploadDir = path.join(process.cwd(), "/public/uploads");

    // Pastikan folder tujuan ada
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error("Error creating upload directory:", error);
    }

    const form = formidable({
      multiples: false, // Jika hanya ingin menerima satu file
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        return res.status(500).json({ error: "Failed to parse form data" });
      }

      // Ambil file pertama (karena files.file adalah array)
      const uploadedFile = files.file instanceof Array ? files.file[0] : files.file;

      if (!uploadedFile) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      try {
        // Pindahkan file ke folder upload
        const tempPath = uploadedFile.filepath;
        const newFileName = `${Date.now()}-${uploadedFile.originalFilename}`;
        const newPath = path.join(uploadDir, newFileName);

        await fs.rename(tempPath, newPath);

        res.status(200).json({ imageUrl: `/uploads/${newFileName}` });
      } catch (error) {
        console.error("Error saving file:", error);
        res.status(500).json({ error: "Failed to save uploaded file" });
      }
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
