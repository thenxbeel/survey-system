-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Survey` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `touchpoint` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `surveyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Option` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `value` VARCHAR(191) NOT NULL,
    `questionId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Response` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `npsScore` INTEGER NULL,
    `feedback` VARCHAR(191) NULL,
    `surveyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Answer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `value` VARCHAR(191) NOT NULL,
    `responseId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Survey` ADD CONSTRAINT `Survey_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `Survey`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Option` ADD CONSTRAINT `Option_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Response` ADD CONSTRAINT `Response_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `Survey`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Answer` ADD CONSTRAINT `Answer_responseId_fkey` FOREIGN KEY (`responseId`) REFERENCES `Response`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
