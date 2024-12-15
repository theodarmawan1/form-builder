
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const banners = await prisma.banner.findMany(); // Pastikan Prisma Client sudah diperbarui
      res.status(200).json(banners);
    } catch (error) {
      console.error("Error fetching banners:", error);
      res.status(500).json({ error: "Failed to fetch banners" });
    }
  } else if (req.method === "POST") {
    const { bannerUrl, bannerLabel } = req.body;

    // Validasi data input
    if (!bannerUrl) {
      res.status(400).json({ error: "bannerUrl is required" });
      return;
    }

    try {
      const newBanner = await prisma.banner.create({
        data: {
          bannerUrl,
          bannerLabel: bannerLabel || null, // Banner label bersifat opsional
        },
      });
      res.status(201).json(newBanner);
    } catch (error) {
      console.error("Error creating banner:", error);
      res.status(500).json({ error: "Failed to create banner" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
