import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsUUID,
  IsNotEmpty,
  IsIn,
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
  search?: string;

  @IsOptional()
  @IsString()
  mimetype?: string;

  @IsOptional()
  @IsString()
  @IsIn(['created_at', 'updated_at', 'filename', 'size', 'mimetype'])
  sort_by?: 'created_at' | 'updated_at' | 'filename' | 'size' | 'mimetype';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sort_order?: 'asc' | 'desc';
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
