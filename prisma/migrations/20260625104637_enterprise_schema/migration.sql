/*
  Warnings:

  - You are about to drop the column `value` on the `answer` table. All the data in the column will be lost.
  - You are about to drop the column `assignedTo` on the `followup` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `followup` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `followup` table. All the data in the column will be lost.
  - You are about to drop the column `issue` on the `followup` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `followup` table. All the data in the column will be lost.
  - You are about to drop the column `resolution` on the `followup` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `followup` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.
  - You are about to drop the column `createdAt` on the `response` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `response` table. All the data in the column will be lost.
  - You are about to drop the column `emoji` on the `response` table. All the data in the column will be lost.
  - You are about to drop the column `followUpRequired` on the `response` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `response` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `survey` table. All the data in the column will be lost.
  - You are about to drop the column `surveyType` on the `survey` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `survey` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `survey` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to drop the column `department` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `user` table. All the data in the column will be lost.
  - Added the required column `answer` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assignedToId` to the `FollowUp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responseId` to the `FollowUp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `FollowUp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Survey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Survey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `survey` DROP FOREIGN KEY `Survey_userId_fkey`;

-- DropIndex
DROP INDEX `Survey_userId_fkey` ON `survey`;

-- AlterTable
ALTER TABLE `answer` DROP COLUMN `value`,
    ADD COLUMN `answer` VARCHAR(191) NOT NULL,
    ADD COLUMN `questionId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `followup` DROP COLUMN `assignedTo`,
    DROP COLUMN `customerName`,
    DROP COLUMN `email`,
    DROP COLUMN `issue`,
    DROP COLUMN `phone`,
    DROP COLUMN `resolution`,
    ADD COLUMN `assignedToId` INTEGER NOT NULL,
    ADD COLUMN `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    ADD COLUMN `remarks` VARCHAR(191) NULL,
    ADD COLUMN `responseId` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE `question` ADD COLUMN `displayOrder` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `response` DROP COLUMN `createdAt`,
    DROP COLUMN `email`,
    DROP COLUMN `emoji`,
    DROP COLUMN `followUpRequired`,
    DROP COLUMN `phone`,
    ADD COLUMN `channel` VARCHAR(191) NULL,
    ADD COLUMN `customerEmail` VARCHAR(191) NULL,
    ADD COLUMN `customerPhone` VARCHAR(191) NULL,
    ADD COLUMN `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `survey` DROP COLUMN `isPublic`,
    DROP COLUMN `surveyType`,
    DROP COLUMN `userId`,
    ADD COLUMN `createdById` INTEGER NOT NULL,
    ADD COLUMN `expiryDate` DATETIME(3) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `visibility` ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PRIVATE',
    MODIFY `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE `user` DROP COLUMN `department`,
    DROP COLUMN `fullName`,
    DROP COLUMN `role`,
    ADD COLUMN `branchId` INTEGER NULL,
    ADD COLUMN `departmentId` INTEGER NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `roleId` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Branch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,

    UNIQUE INDEX `Branch_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `branchId` INTEGER NULL,

    UNIQUE INDEX `Department_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `action` VARCHAR(191) NOT NULL,
    `details` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Survey` ADD CONSTRAINT `Survey_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Answer` ADD CONSTRAINT `Answer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FollowUp` ADD CONSTRAINT `FollowUp_responseId_fkey` FOREIGN KEY (`responseId`) REFERENCES `Response`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FollowUp` ADD CONSTRAINT `FollowUp_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
