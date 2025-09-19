/*
  Warnings:

  - You are about to drop the column `doi` on the `VectorRiskData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."VectorRiskData" DROP COLUMN "doi";

-- CreateTable
CREATE TABLE "public"."Doi" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "creator" VARCHAR(100) NOT NULL,
    "publisher" VARCHAR(100) NOT NULL,
    "publicationYear" INTEGER NOT NULL,
    "resourceType" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Doi_pkey" PRIMARY KEY ("id")
);
