-- CreateTable
CREATE TABLE `Device` (
    `DeviceID` INTEGER NOT NULL AUTO_INCREMENT,
    `DeviceName` VARCHAR(191) NOT NULL,
    `DeviceLocation` VARCHAR(100) NULL,
    `IPAddress` VARCHAR(50) NULL,

    PRIMARY KEY (`DeviceID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PH_Reading` (
    `ReadingID` BIGINT NOT NULL AUTO_INCREMENT,
    `DeviceID` INTEGER NOT NULL,
    `SensorName` VARCHAR(191) NOT NULL DEFAULT 'pH_Sensor',
    `PH_Value` DOUBLE NOT NULL,
    `RecordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`ReadingID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Temperature_Reading` (
    `ReadingID` BIGINT NOT NULL AUTO_INCREMENT,
    `DeviceID` INTEGER NOT NULL,
    `SensorName` VARCHAR(191) NOT NULL DEFAULT 'Temperature_Sensor',
    `Temperature_Value` DOUBLE NOT NULL,
    `RecordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`ReadingID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TDS_Reading` (
    `ReadingID` BIGINT NOT NULL AUTO_INCREMENT,
    `DeviceID` INTEGER NOT NULL,
    `SensorName` VARCHAR(191) NOT NULL DEFAULT 'TDS_Sensor',
    `TDS_Value` DOUBLE NOT NULL,
    `RecordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`ReadingID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GPS_Reading` (
    `ReadingID` BIGINT NOT NULL AUTO_INCREMENT,
    `DeviceID` INTEGER NOT NULL,
    `SensorName` VARCHAR(191) NOT NULL DEFAULT 'GPS_Sensor',
    `Latitude` DOUBLE NOT NULL,
    `Longitude` DOUBLE NOT NULL,
    `Altitude` DOUBLE NULL,
    `RecordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`ReadingID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Turbidity_Reading` (
    `ReadingID` BIGINT NOT NULL AUTO_INCREMENT,
    `DeviceID` INTEGER NOT NULL,
    `SensorName` VARCHAR(191) NOT NULL DEFAULT 'Turbidity_Sensor',
    `Turbidity_Value` DOUBLE NOT NULL,
    `RecordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`ReadingID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `All_Sensor_Reading` (
    `ReadingID` BIGINT NOT NULL AUTO_INCREMENT,
    `DeviceID` INTEGER NOT NULL,
    `SensorType` VARCHAR(191) NOT NULL,
    `SensorName` VARCHAR(191) NULL,
    `ReadingValue1` DOUBLE NULL,
    `ReadingValue2` DOUBLE NULL,
    `ReadingValue3` DOUBLE NULL,
    `Unit` VARCHAR(20) NULL,
    `RecordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`ReadingID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PH_Reading` ADD CONSTRAINT `PH_Reading_DeviceID_fkey` FOREIGN KEY (`DeviceID`) REFERENCES `Device`(`DeviceID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Temperature_Reading` ADD CONSTRAINT `Temperature_Reading_DeviceID_fkey` FOREIGN KEY (`DeviceID`) REFERENCES `Device`(`DeviceID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TDS_Reading` ADD CONSTRAINT `TDS_Reading_DeviceID_fkey` FOREIGN KEY (`DeviceID`) REFERENCES `Device`(`DeviceID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GPS_Reading` ADD CONSTRAINT `GPS_Reading_DeviceID_fkey` FOREIGN KEY (`DeviceID`) REFERENCES `Device`(`DeviceID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Turbidity_Reading` ADD CONSTRAINT `Turbidity_Reading_DeviceID_fkey` FOREIGN KEY (`DeviceID`) REFERENCES `Device`(`DeviceID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `All_Sensor_Reading` ADD CONSTRAINT `All_Sensor_Reading_DeviceID_fkey` FOREIGN KEY (`DeviceID`) REFERENCES `Device`(`DeviceID`) ON DELETE CASCADE ON UPDATE CASCADE;
