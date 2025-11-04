export interface SensorApiResponse {
    DeviceID: number;
    DeviceName: string;
    DeviceLocation?: string | null;
    IPAddress?: string | null;

    PH_Readings: PHReading[];
    Temperature_Readings: TemperatureReading[];
    TDS_Readings: TDSReading[];
    GPS_Readings: GPSReading[];
    Turbidity_Readings: TurbidityReading[];
    All_Sensor_Readings?: AllSensorReading[];
}

export interface PHReading {
    ReadingID: number;
    DeviceID: number;
    SensorName: string; // "pH_Sensor"
    PH_Value: number;
    RecordedAt: string; // ISO date string
}

export interface TemperatureReading {
    ReadingID: number;
    DeviceID: number;
    SensorName: string; // "Temperature_Sensor"
    Temperature_Value: number;
    RecordedAt: string;
}

export interface TDSReading {
    ReadingID: number;
    DeviceID: number;
    SensorName: string; // "TDS_Sensor"
    TDS_Value: number;
    RecordedAt: string;
}

export interface GPSReading {
    ReadingID: number;
    DeviceID: number;
    SensorName: string; // "GPS_Sensor"
    Latitude: number;
    Longitude: number;
    Altitude?: number | null;
    RecordedAt: string;
}

export interface TurbidityReading {
    ReadingID: number;
    DeviceID: number;
    SensorName: string; // "Turbidity_Sensor"
    NTU_Value: number;
    Voltage?: number | null;
    RecordedAt: string;
}

export interface AllSensorReading {
    ReadingID: number;
    DeviceID: number;
    SensorType: string;
    SensorName?: string | null;
    ReadingValue1?: number | null;
    ReadingValue2?: number | null;
    ReadingValue3?: number | null;
    Unit?: string | null;
    RecordedAt: string;
}
