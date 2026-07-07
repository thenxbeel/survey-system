/*
  Warnings:

  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[employeeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `surveyType` to the `Survey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `question` ADD COLUMN `required` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `response` ADD COLUMN `customerName` VARCHAR(191) NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `emoji` VARCHAR(191) NULL,
    ADD COLUMN `followUpRequired` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `phone` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `survey` ADD COLUMN `isPublic` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
    ADD COLUMN `surveyType` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `name`,
    ADD COLUMN `department` VARCHAR(191) NOT NULL,
    ADD COLUMN `employeeId` VARCHAR(191) NOT NULL,
    ADD COLUMN `fullName` VARCHAR(191) NOT NULL,
    ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'staff';

-- CreateTable
CREATE TABLE `FollowUp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `issue` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Open',
    `assignedTo` VARCHAR(191) NULL,
    `resolution` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_employeeId_key` ON `User`(`employeeId`);
