// pages/api/uploadBanner.js

import { v4 as uuidv4 } from "uuid"; // Untuk membuat ID unik
import fs from "fs";
import path from "path";

const IMAGE_DIR = path.resolve(process.cwd(), "public/uploads"); // Direktori penyimpanan gambar

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { imageBase64 } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ message: "Image data is required" });
      }

      // Simpan file ke direktori server
      const imageName = `${uuidv4()}.png`;
      const imagePath = path.join(IMAGE_DIR, imageName);

      if (!fs.existsSync(IMAGE_DIR)) {
        fs.mkdirSync(IMAGE_DIR, { recursive: true }); // Buat folder jika belum ada
      }

      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      fs.writeFileSync(imagePath, base64Data, "base64");

      // Simpan URL ke database (simulasi)
      const imageUrl = `/uploads/${imageName}`; // URL relatif ke public/

      // Return URL untuk digunakan di frontend
      res.status(200).json({ imageUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
