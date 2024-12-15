import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    if (req.method === "PUT") {
      const { bannerUrl, bannerLabel } = req.body;
      const updatedBanner = await prisma.banner.update({
        where: { id },
        data: { bannerUrl, bannerLabel },
      });
      return res.status(200).json(updatedBanner);
    } else if (req.method === "DELETE") {
      await prisma.banner.delete({ where: { id } });
      return res.status(204).end();
    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
