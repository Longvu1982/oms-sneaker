-- CreateEnum
CREATE TYPE "DeliveryCodeStatus" AS ENUM ('PENDING', 'EXIST', 'DELIVERD');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryCodeStatus" "DeliveryCodeStatus" NOT NULL DEFAULT 'PENDING';
