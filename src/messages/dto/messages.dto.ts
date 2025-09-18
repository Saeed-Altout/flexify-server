import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsIn,
  Min,
  Max,
  IsEmail,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum MessageStatusEnum {
  Unread = 'unread',
  Read = 'read',
  Replied = 'replied',
  Archived = 'archived',
}

export class CreateMessageDto {
  @ApiProperty({ example: 'John Doe', description: 'Sender name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Sender email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Project Inquiry', description: 'Message subject' })
  @IsString()
  subject: string;

  @ApiProperty({
    example: 'I would like to discuss a potential project with you.',
    description: 'Message content',
  })
  @IsString()
  message: string;
}

export class CreateReplyDto {
  @ApiProperty({
    example: 'Thank you for your message. I will get back to you soon.',
    description: 'Reply content',
  })
  @IsString()
  reply: string;
}

export class UpdateMessageStatusDto {
  @ApiProperty({
    example: 'read',
    enum: MessageStatusEnum,
    description: 'Message status',
  })
  @IsEnum(MessageStatusEnum)
  status: MessageStatusEnum;
}

export class MessageQueryDto {
  @ApiPropertyOptional({
    example: 'unread',
    enum: MessageStatusEnum,
    description: 'Filter by status',
  })
  @IsOptional()
  @IsEnum(MessageStatusEnum)
  status?: MessageStatusEnum;

  @ApiPropertyOptional({
    example: 'user-id-here',
    description: 'Filter by user ID',
  })
  @IsOptional()
  @IsUUID('4')
  user_id?: string;

  @ApiPropertyOptional({
    example: 'project inquiry',
    description: 'Search term',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number', minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    example: 'created_at',
    enum: ['name', 'email', 'status', 'created_at'],
    description: 'Sort by field',
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'email', 'status', 'created_at'])
  sort_by?: 'name' | 'email' | 'status' | 'created_at';

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sort_order?: 'asc' | 'desc';
}

export class MessageDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Message ID',
  })
  id: string;

  @ApiProperty({ example: 'John Doe', description: 'Sender name' })
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Sender email' })
  email: string;

  @ApiProperty({ example: 'Project Inquiry', description: 'Message subject' })
  subject: string;

  @ApiProperty({
    example: 'I would like to discuss a potential project with you.',
    description: 'Message content',
  })
  message: string;

  @ApiProperty({
    example: 'unread',
    enum: MessageStatusEnum,
    description: 'Message status',
  })
  status: MessageStatusEnum;

  @ApiPropertyOptional({
    example: 'user-id-here',
    description: 'User ID who replied',
  })
  user_id?: string;

  @ApiPropertyOptional({
    example: '192.168.1.1',
    description: 'IP address',
  })
  ip_address?: string;

  @ApiPropertyOptional({
    example: 'Mozilla/5.0...',
    description: 'User agent',
  })
  user_agent?: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Creation timestamp',
  })
  created_at: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Last update timestamp',
  })
  updated_at: string;
}

export class MessageReplyDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Reply ID',
  })
  id: string;

  @ApiProperty({
    example: 'message-id-here',
    description: 'Message ID',
  })
  message_id: string;

  @ApiProperty({
    example: 'user-id-here',
    description: 'User ID who replied',
  })
  user_id: string;

  @ApiProperty({
    example: 'Thank you for your message. I will get back to you soon.',
    description: 'Reply content',
  })
  reply: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Creation timestamp',
  })
  created_at: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Last update timestamp',
  })
  updated_at: string;
}

export class MessageWithRepliesDto extends MessageDto {
  @ApiProperty({
    type: [MessageReplyDto],
    description: 'Message replies',
  })
  replies: MessageReplyDto[];
}

export class MessageListResponseDto {
  @ApiProperty({ type: [MessageDto], description: 'List of messages' })
  messages: MessageDto[];

  @ApiProperty({ example: 50, description: 'Total number of messages' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  limit: number;

  @ApiProperty({ example: 5, description: 'Total number of pages' })
  total_pages: number;
}

export class MessageStatsDto {
  @ApiProperty({ example: 100, description: 'Total messages' })
  total: number;

  @ApiProperty({ example: 25, description: 'Unread messages' })
  unread: number;

  @ApiProperty({ example: 50, description: 'Read messages' })
  read: number;

  @ApiProperty({ example: 25, description: 'Replied messages' })
  replied: number;

  @ApiProperty({ example: 5, description: 'Messages today' })
  today: number;

  @ApiProperty({ example: 20, description: 'Messages this week' })
  this_week: number;

  @ApiProperty({ example: 80, description: 'Messages this month' })
  this_month: number;
}

export class StandardResponseDto<T> {
  @ApiProperty({ description: 'Response data' })
  data: T;

  @ApiProperty({ example: 'Success message', description: 'Response message' })
  message: string;

  @ApiProperty({ example: 'success', description: 'Response status' })
  status: string;
}
