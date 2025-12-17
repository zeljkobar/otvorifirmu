/*
  Warnings:

  - You are about to drop the column `activity` on the `company_requests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `company_requests` DROP COLUMN `activity`,
    ADD COLUMN `activityCodeId` INTEGER NULL;

-- CreateTable
CREATE TABLE `activity_codes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `section` VARCHAR(191) NOT NULL,
    `sectionName` VARCHAR(191) NOT NULL,
    `group` VARCHAR(191) NOT NULL,
    `groupName` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `activity_codes_code_key`(`code`),
    INDEX `activity_codes_section_idx`(`section`),
    INDEX `activity_codes_group_idx`(`group`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `company_requests_activityCodeId_fkey` ON `company_requests`(`activityCodeId`);
