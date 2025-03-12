/*
  Warnings:

  - The `aircraft` column on the `Flight` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `accompaniedBy` on the `Passenger` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Passenger` table. All the data in the column will be lost.
  - You are about to drop the column `mealPreference` on the `Passenger` table. All the data in the column will be lost.
  - You are about to drop the column `seatPreference` on the `Passenger` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Passenger` table. All the data in the column will be lost.
  - Added the required column `type` to the `AddOn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cabinClass` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDuration` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `airline` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amenities` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baggage` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinationDetails` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originDetails` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packageType` to the `Insurance` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Flight_bookingId_key";

-- AlterTable
ALTER TABLE "AddOn" ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "cabinClass" TEXT NOT NULL,
ADD COLUMN     "layoverTimes" INTEGER[],
ADD COLUMN     "totalDuration" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Flight" ADD COLUMN     "airline" TEXT NOT NULL,
ADD COLUMN     "amenities" JSONB NOT NULL,
ADD COLUMN     "baggage" JSONB NOT NULL,
ADD COLUMN     "destinationDetails" JSONB NOT NULL,
ADD COLUMN     "isLayover" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "layoverDuration" INTEGER,
ADD COLUMN     "originDetails" JSONB NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
DROP COLUMN "aircraft",
ADD COLUMN     "aircraft" JSONB;

-- AlterTable
ALTER TABLE "Insurance" ADD COLUMN     "packageType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Passenger" DROP COLUMN "accompaniedBy",
DROP COLUMN "createdAt",
DROP COLUMN "mealPreference",
DROP COLUMN "seatPreference",
DROP COLUMN "updatedAt",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE INDEX "Payment_bookingId_idx" ON "Payment"("bookingId");
