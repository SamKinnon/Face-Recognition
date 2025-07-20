/*
  Warnings:

  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to drop the column `createdAt` on the `vote` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('ADMIN', 'VOTER') NOT NULL DEFAULT 'VOTER';

-- AlterTable
ALTER TABLE `vote` DROP COLUMN `createdAt`;
