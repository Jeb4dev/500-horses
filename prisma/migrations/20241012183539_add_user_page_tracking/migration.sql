/*
  Warnings:

  - You are about to drop the column `view_count` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `viewed_users` on the `Page` table. All the data in the column will be lost.
  - Added the required column `content` to the `Page` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Page` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Page" DROP COLUMN "view_count",
DROP COLUMN "viewed_users",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPage" (
    "userId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "foundAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPage_pkey" PRIMARY KEY ("userId","pageId")
);

-- AddForeignKey
ALTER TABLE "UserPage" ADD CONSTRAINT "UserPage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPage" ADD CONSTRAINT "UserPage_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
