-- Unifica GoalStatus ao eixo comum (TODO/DOING/DONE) + ARCHIVED, transformando
-- os dados existentes: ACTIVE -> DOING, ACHIEVED -> DONE, ARCHIVED -> ARCHIVED.
ALTER TYPE "GoalStatus" RENAME TO "GoalStatus_old";

CREATE TYPE "GoalStatus" AS ENUM ('TODO', 'DOING', 'DONE', 'ARCHIVED');

ALTER TABLE "goals" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "goals"
  ALTER COLUMN "status" TYPE "GoalStatus"
  USING (
    CASE "status"::text
      WHEN 'ACTIVE' THEN 'DOING'
      WHEN 'ACHIEVED' THEN 'DONE'
      WHEN 'ARCHIVED' THEN 'ARCHIVED'
      ELSE 'TODO'
    END
  )::"GoalStatus";

ALTER TABLE "goals" ALTER COLUMN "status" SET DEFAULT 'TODO';

DROP TYPE "GoalStatus_old";
