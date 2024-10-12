-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "viewed_users" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);
