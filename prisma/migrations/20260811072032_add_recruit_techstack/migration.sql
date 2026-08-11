-- AlterTable
ALTER TABLE "Recruit" ADD COLUMN     "techStack" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "Recruit_techStack_idx" ON "Recruit" USING GIN ("techStack");
