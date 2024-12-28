/*
  Warnings:

  - The primary key for the `ShippingStore` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Source` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `ShippingStore` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Source` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('ONGOING', 'LANDED', 'SHIPPED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_id_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_shippingStoreId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_sourceId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'ONGOING',
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "sourceId" SET DATA TYPE TEXT,
ALTER COLUMN "shippingStoreId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ShippingStore" DROP CONSTRAINT "ShippingStore_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ADD CONSTRAINT "ShippingStore_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ShippingStore_id_seq";

-- AlterTable
ALTER TABLE "Source" DROP CONSTRAINT "Source_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Source_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Source_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "ShippingStore_id_key" ON "ShippingStore"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Source_id_key" ON "Source"("id");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingStoreId_fkey" FOREIGN KEY ("shippingStoreId") REFERENCES "ShippingStore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
