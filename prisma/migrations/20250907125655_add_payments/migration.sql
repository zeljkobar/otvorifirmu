/*
  Warnings:

  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `company_requests` DROP FOREIGN KEY `company_requests_userId_fkey`;

-- DropForeignKey
ALTER TABLE `founders` DROP FOREIGN KEY `founders_companyRequestId_fkey`;

-- DropForeignKey
ALTER TABLE `generated_documents` DROP FOREIGN KEY `generated_documents_companyRequestId_fkey`;

-- DropForeignKey
ALTER TABLE `generated_documents` DROP FOREIGN KEY `generated_documents_templateId_fkey`;

-- AlterTable
ALTER TABLE `company_requests` ADD COLUMN `price` DECIMAL(8, 2) NULL,
    MODIFY `status` ENUM('DRAFT', 'AWAITING_PAYMENT', 'PAYMENT_PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `password` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `companyRequestId` INTEGER NOT NULL,
    `amount` DECIMAL(8, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'RSD',
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'bank_transfer',
    `referenceNumber` VARCHAR(191) NULL,
    `adminNotes` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `approvedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_companyRequestId_key`(`companyRequestId`),
    INDEX `payments_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
