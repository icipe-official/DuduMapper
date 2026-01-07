/*
  Warnings:

  - You are about to drop the column `title` on the `Doi` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[modelId]` on the table `Doi` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `modelId` to the `Doi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Doi" DROP COLUMN "title",
ADD COLUMN     "modelId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Doi_modelId_key" ON "public"."Doi"("modelId");

-- AddForeignKey
ALTER TABLE "public"."Doi" ADD CONSTRAINT "Doi_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."VectorRiskData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
