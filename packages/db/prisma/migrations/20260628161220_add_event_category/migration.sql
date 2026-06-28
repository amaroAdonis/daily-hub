-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('WORK', 'PERSONAL', 'HEALTH', 'SOCIAL', 'STUDY', 'OTHER');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "category" "EventCategory" NOT NULL DEFAULT 'OTHER';
