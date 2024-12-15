import formidable from "formidable";
import fs from "fs/promises";
import cloudinary from "cloudinary";
import type { NextApiRequest, NextApiResponse } from "next";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        return res.status(500).json({ error: "Failed to parse form data" });
      }

      const uploadedFile = files.file instanceof Array ? files.file[0] : files.file;
      if (!uploadedFile) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      try {
        const result = await cloudinary.v2.uploader.upload(uploadedFile.filepath);
        res.status(200).json({ imageUrl: result.secure_url });
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        res.status(500).json({ error: "Failed to upload to Cloudinary" });
      }
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
