-- CreateTable
CREATE TABLE "VectorRiskData" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "region" VARCHAR(100) NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "highRisk" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VectorRiskData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "vectorRiskDataId" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_vectorRiskDataId_fkey" FOREIGN KEY ("vectorRiskDataId") REFERENCES "VectorRiskData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
