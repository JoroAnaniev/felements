-- CreateTable
CREATE TABLE `Devices` (
    `DeviceID` INTEGER NOT NULL AUTO_INCREMENT,
    `DeviceName` VARCHAR(191) NOT NULL,
    `DeviceLocation` VARCHAR(100) NULL,
    `IPAddress` VARCHAR(15) NULL,

    PRIMARY KEY (`DeviceID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PH_Readings` (
    `ReadingID` BIGINT NOT NULL AUTO_INCREMENT,
    `DeviceID` INTEGER NOT NULL,
    `SensorName` VARCHAR(50) NOT NULL DEFAULT 'pH_Sensor',
    `PH_Value` DOUBLE NOT NULL,
    `RecordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`ReadingID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Temperature_Readings` (
    `ReadingID` BIGINT NOT NULL AUTO_INCREMENT,
    `DeviceID` INTEGER NOT NULL,
    `SensorName` VARCHAR(50) NOT NULL DEFAULT 'Temperature_Sensor',
    `Temperature_Value` DOUBLE NOT NULL,
    `RecordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`ReadingID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TDS_Readings` (
    `ReadingID` BIGINT NOT NULL AUTO_INCREMENT,
    `DeviceID` INTEGER NOT NULL,
    `SensorName` VARCHAR(50) NOT NULL DEFAULT 'TDS_Sensor',
    `TDS_Value` DOUBLE NOT NULL,
    `RecordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`ReadingID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GPS_Readings` (
    `ReadingID` BIGINT NOT NULL AUTO_INCREMENT,
    `DeviceID` INTEGER NOT NULL,
    `SensorName` VARCHAR(50) NOT NULL DEFAULT 'GPS_Sensor',
    `Latitude` DOUBLE NOT NULL,
    `Longitude` DOUBLE NOT NULL,
    `Altitude` DOUBLE NULL,
    `RecordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`ReadingID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Turbidity_Readings` (
    `ReadingID` BIGINT NOT NULL AUTO_INCREMENT,
    `DeviceID` INTEGER NOT NULL,
    `SensorName` VARCHAR(50) NULL DEFAULT 'Turbidity_Sensor',
    `NTU_Value` DOUBLE NOT NULL,
    `Voltage` DOUBLE NULL,
    `RecordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`ReadingID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `All_Sensor_Reading` (
    `ReadingID` BIGINT NOT NULL AUTO_INCREMENT,
    `DeviceID` INTEGER NOT NULL,
    `SensorType` VARCHAR(50) NOT NULL,
    `SensorName` VARCHAR(50) NULL,
    `ReadingValue1` DOUBLE NULL,
    `ReadingValue2` DOUBLE NULL,
    `ReadingValue3` DOUBLE NULL,
    `Unit` VARCHAR(20) NULL,
    `RecordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`ReadingID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PH_Readings` ADD CONSTRAINT `PH_Readings_DeviceID_fkey` FOREIGN KEY (`DeviceID`) REFERENCES `Devices`(`DeviceID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Temperature_Readings` ADD CONSTRAINT `Temperature_Readings_DeviceID_fkey` FOREIGN KEY (`DeviceID`) REFERENCES `Devices`(`DeviceID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TDS_Readings` ADD CONSTRAINT `TDS_Readings_DeviceID_fkey` FOREIGN KEY (`DeviceID`) REFERENCES `Devices`(`DeviceID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GPS_Readings` ADD CONSTRAINT `GPS_Readings_DeviceID_fkey` FOREIGN KEY (`DeviceID`) REFERENCES `Devices`(`DeviceID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Turbidity_Readings` ADD CONSTRAINT `Turbidity_Readings_DeviceID_fkey` FOREIGN KEY (`DeviceID`) REFERENCES `Devices`(`DeviceID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `All_Sensor_Reading` ADD CONSTRAINT `All_Sensor_Reading_DeviceID_fkey` FOREIGN KEY (`DeviceID`) REFERENCES `Devices`(`DeviceID`) ON DELETE CASCADE ON UPDATE CASCADE;
