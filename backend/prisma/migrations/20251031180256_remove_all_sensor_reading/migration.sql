/*
  Warnings:

  - You are about to drop the `All_Sensor_Reading` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `All_Sensor_Reading` DROP FOREIGN KEY `All_Sensor_Reading_DeviceID_fkey`;

-- DropTable
DROP TABLE `All_Sensor_Reading`;
