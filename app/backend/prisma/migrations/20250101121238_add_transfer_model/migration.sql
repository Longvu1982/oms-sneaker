-- AlterTable
ALTER TABLE "User" ADD COLUMN     "transfered" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Transfered" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Transfered_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transfered_id_key" ON "Transfered"("id");

-- AddForeignKey
ALTER TABLE "Transfered" ADD CONSTRAINT "Transfered_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
