import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class ImageQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mimetype?: string;
}

export class DeleteImageDto {
  @IsUUID('4')
  @IsNotEmpty()
  image_id: string;
}

export class BulkDeleteImagesDto {
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  image_ids: string[];
}
