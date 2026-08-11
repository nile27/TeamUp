-- CreateEnum
CREATE TYPE "CommunityTag" AS ENUM ('IDEA', 'QUESTION', 'ETC');

-- CreateEnum
CREATE TYPE "RecruitType" AS ENUM ('DEV', 'PLAN');

-- CreateEnum
CREATE TYPE "RecruitStatus" AS ENUM ('OPEN', 'CLOSED', 'DONE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityPost" (
    "id" TEXT NOT NULL,
    "tag" "CommunityTag" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" UUID NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruit" (
    "id" TEXT NOT NULL,
    "type" "RecruitType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" UUID NOT NULL,
    "problem" TEXT,
    "targetUser" TEXT,
    "coreFeatures" TEXT,
    "reference" TEXT,
    "completeness" INTEGER NOT NULL DEFAULT 0,
    "status" "RecruitStatus" NOT NULL DEFAULT 'OPEN',
    "promotedFromId" TEXT,
    "embedding" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recruit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "recruitId" TEXT NOT NULL,

    CONSTRAINT "RecruitRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "message" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "applicantId" UUID NOT NULL,
    "recruitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" UUID NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "CommunityPost_tag_idx" ON "CommunityPost"("tag");

-- CreateIndex
CREATE INDEX "CommunityPost_createdAt_idx" ON "CommunityPost"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Recruit_promotedFromId_key" ON "Recruit"("promotedFromId");

-- CreateIndex
CREATE INDEX "Recruit_type_idx" ON "Recruit"("type");

-- CreateIndex
CREATE INDEX "Recruit_status_idx" ON "Recruit"("status");

-- CreateIndex
CREATE INDEX "Recruit_createdAt_idx" ON "Recruit"("createdAt");

-- CreateIndex
CREATE INDEX "RecruitRole_recruitId_idx" ON "RecruitRole"("recruitId");

-- CreateIndex
CREATE INDEX "Application_recruitId_idx" ON "Application"("recruitId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_applicantId_recruitId_key" ON "Application"("applicantId", "recruitId");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- AddForeignKey
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruit" ADD CONSTRAINT "Recruit_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruit" ADD CONSTRAINT "Recruit_promotedFromId_fkey" FOREIGN KEY ("promotedFromId") REFERENCES "CommunityPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitRole" ADD CONSTRAINT "RecruitRole_recruitId_fkey" FOREIGN KEY ("recruitId") REFERENCES "Recruit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_recruitId_fkey" FOREIGN KEY ("recruitId") REFERENCES "Recruit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
