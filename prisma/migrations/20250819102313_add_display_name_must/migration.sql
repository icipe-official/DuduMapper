/*
  Warnings:

  - Made the column `displayName` on table `VectorRiskData` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "VectorRiskData" ALTER COLUMN "displayName" SET NOT NULL;
