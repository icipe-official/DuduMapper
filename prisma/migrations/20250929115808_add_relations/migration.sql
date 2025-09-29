/*
  Warnings:

  - The `creator` column on the `Doi` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Doi" DROP COLUMN "creator",
ADD COLUMN     "creator" TEXT[];
