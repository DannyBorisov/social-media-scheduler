/*
  Warnings:

  - The `medias` column on the `posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."posts" DROP COLUMN "medias",
ADD COLUMN     "medias" TEXT[];
