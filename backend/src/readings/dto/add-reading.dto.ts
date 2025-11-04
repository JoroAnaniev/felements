import { IsInt, IsOptional, IsArray, IsObject, IsDateString } from 'class-validator';

export class AddReadingDto {
    @IsInt()
    deviceId: number;

    @IsArray()
    @IsOptional()
    values?: number[];

    @IsObject()
    @IsOptional()
    extra?: { [key: string]: number | string };

    @IsDateString()
    @IsOptional()
    timestamp?: string;
}