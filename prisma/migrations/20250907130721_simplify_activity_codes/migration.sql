/*
  Warnings:

  - You are about to drop the column `group` on the `activity_codes` table. All the data in the column will be lost.
  - You are about to drop the column `groupName` on the `activity_codes` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `activity_codes` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `activity_codes` table. All the data in the column will be lost.
  - You are about to drop the column `sectionName` on the `activity_codes` table. All the data in the column will be lost.
  - Added the required column `description` to the `activity_codes` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `activity_codes_group_idx` ON `activity_codes`;

-- DropIndex
DROP INDEX `activity_codes_section_idx` ON `activity_codes`;

-- AlterTable
ALTER TABLE `activity_codes` DROP COLUMN `group`,
    DROP COLUMN `groupName`,
    DROP COLUMN `name`,
    DROP COLUMN `section`,
    DROP COLUMN `sectionName`,
    ADD COLUMN `description` VARCHAR(191) NOT NULL;
