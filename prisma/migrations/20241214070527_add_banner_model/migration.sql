-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "bannerUrl" TEXT NOT NULL,
    "bannerLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);
