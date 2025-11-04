/*
  Warnings:

  - The primary key for the `All_Sensor_Reading` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `ReadingID` on the `All_Sensor_Reading` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `GPS_Readings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `ReadingID` on the `GPS_Readings` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `PH_Readings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `ReadingID` on the `PH_Readings` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `TDS_Readings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `ReadingID` on the `TDS_Readings` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Temperature_Readings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `ReadingID` on the `Temperature_Readings` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Turbidity_Readings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `ReadingID` on the `Turbidity_Readings` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `All_Sensor_Reading` DROP PRIMARY KEY,
    MODIFY `ReadingID` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`ReadingID`);

-- AlterTable
ALTER TABLE `GPS_Readings` DROP PRIMARY KEY,
    MODIFY `ReadingID` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`ReadingID`);

-- AlterTable
ALTER TABLE `PH_Readings` DROP PRIMARY KEY,
    MODIFY `ReadingID` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`ReadingID`);

-- AlterTable
ALTER TABLE `TDS_Readings` DROP PRIMARY KEY,
    MODIFY `ReadingID` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`ReadingID`);

-- AlterTable
ALTER TABLE `Temperature_Readings` DROP PRIMARY KEY,
    MODIFY `ReadingID` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`ReadingID`);

-- AlterTable
ALTER TABLE `Turbidity_Readings` DROP PRIMARY KEY,
    MODIFY `ReadingID` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`ReadingID`);
