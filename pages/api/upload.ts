import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // Nonaktifkan body parser untuk menangani file
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const filePath = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
  }

  const busboy = require("busboy"); // Pastikan package ini terinstall
  const bb = busboy({ headers: req.headers });

  bb.on("file", (fieldname : any, file : any, info : any) => {
    const { filename } = info;
    const saveTo = path.join(filePath, filename);
    file.pipe(fs.createWriteStream(saveTo));
  });

  bb.on("close", () => {
    res.status(200).json({ message: "File uploaded successfully" });
  });

  req.pipe(bb);
}
