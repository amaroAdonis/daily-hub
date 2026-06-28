-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('TODO', 'DOING', 'DONE');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'TODO';
