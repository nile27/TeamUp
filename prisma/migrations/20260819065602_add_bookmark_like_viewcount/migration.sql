-- AlterTable
ALTER TABLE "Recruit" ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "RecruitBookmark" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "recruitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecruitBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityPostLike" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityPostLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecruitBookmark_recruitId_idx" ON "RecruitBookmark"("recruitId");

-- CreateIndex
CREATE UNIQUE INDEX "RecruitBookmark_userId_recruitId_key" ON "RecruitBookmark"("userId", "recruitId");

-- CreateIndex
CREATE INDEX "CommunityPostLike_postId_idx" ON "CommunityPostLike"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityPostLike_userId_postId_key" ON "CommunityPostLike"("userId", "postId");

-- AddForeignKey
ALTER TABLE "RecruitBookmark" ADD CONSTRAINT "RecruitBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitBookmark" ADD CONSTRAINT "RecruitBookmark_recruitId_fkey" FOREIGN KEY ("recruitId") REFERENCES "Recruit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPostLike" ADD CONSTRAINT "CommunityPostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPostLike" ADD CONSTRAINT "CommunityPostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
