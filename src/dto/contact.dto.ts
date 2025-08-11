import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsIn,
} from 'class-validator';

// Request DTOs
export class CreateContactMessageDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Message subject',
    example: 'Project Inquiry',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: 'Message content',
    example: 'I would like to discuss a potential project collaboration.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Source of the contact (optional)',
    example: 'portfolio',
    required: false,
  })
  @IsOptional()
  @IsString()
  source?: string;
}

export class CreateReplyDto {
  @ApiProperty({
    description: 'Reply content from admin',
    example: 'Thank you for your inquiry. I will get back to you soon.',
  })
  @IsString()
  @IsNotEmpty()
  reply_content: string;
}

export class UpdateMessageStatusDto {
  @ApiProperty({
    description: 'New status for the message',
    enum: ['PENDING', 'REPLIED', 'ARCHIVED'],
    example: 'REPLIED',
  })
  @IsIn(['PENDING', 'REPLIED', 'ARCHIVED'])
  @IsNotEmpty()
  status: 'PENDING' | 'REPLIED' | 'ARCHIVED';
}

// Response DTOs
export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'Response data',
  })
  data: T;

  @ApiProperty({
    description: 'Response status',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;
}

export class ContactMessageResponseDto {
  @ApiProperty({
    description: 'Contact message ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Message subject',
    example: 'Project Inquiry',
  })
  subject: string;

  @ApiProperty({
    description: 'Message content',
    example: 'I would like to discuss a potential project collaboration.',
  })
  message: string;

  @ApiProperty({
    description: 'Message status',
    enum: ['PENDING', 'REPLIED', 'ARCHIVED'],
    example: 'PENDING',
  })
  status: 'PENDING' | 'REPLIED' | 'ARCHIVED';

  @ApiProperty({
    description: 'Source of the contact',
    example: 'portfolio',
  })
  source: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updated_at: string;
}

export class ContactMessageWithRepliesResponseDto extends ContactMessageResponseDto {
  @ApiProperty({
    description: 'Replies to this message',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        reply_content: { type: 'string' },
        admin_id: { type: 'string' },
        created_at: { type: 'string' },
      },
    },
  })
  replies: any[];
}

export class ContactReplyResponseDto {
  @ApiProperty({
    description: 'Reply ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Message ID this reply belongs to',
    example: 'uuid-string',
  })
  message_id: string;

  @ApiProperty({
    description: 'Admin ID who sent the reply',
    example: 'uuid-string',
  })
  admin_id: string;

  @ApiProperty({
    description: 'Reply content',
    example: 'Thank you for your inquiry. I will get back to you soon.',
  })
  reply_content: string;

  @ApiProperty({
    description: 'Reply creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: string;
}

export class MessageStatsResponseDto {
  @ApiProperty({
    description: 'Total number of messages',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Number of pending messages',
    example: 5,
  })
  pending: number;

  @ApiProperty({
    description: 'Number of replied messages',
    example: 18,
  })
  replied: number;

  @ApiProperty({
    description: 'Number of archived messages',
    example: 2,
  })
  archived: number;
}

// User-friendly response messages
export const CONTACT_MESSAGES = {
  MESSAGE_CREATED: 'Thank you for your message! I will get back to you soon.',
  MESSAGE_RETRIEVED: 'Message retrieved successfully',
  MESSAGES_RETRIEVED: 'Messages retrieved successfully',
  REPLY_CREATED: 'Reply sent successfully to the user',
  STATUS_UPDATED: 'Message status updated successfully',
  MESSAGE_DELETED: 'Message deleted successfully',
  STATS_RETRIEVED: 'Message statistics retrieved successfully',
  MESSAGES_BY_STATUS: 'Messages filtered by status retrieved successfully',
  EMAIL_TEST_SUCCESS: 'Email service is working correctly',
  VALIDATION_ERROR: 'Please check your input and try again',
  NOT_FOUND: 'The requested resource was not found',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  INTERNAL_ERROR: 'An internal server error occurred. Please try again later',
} as const;
