import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsString()
  source?: string;
}

export class CreateReplyDto {
  @IsString()
  @IsNotEmpty()
  reply_content: string;
}

export class UpdateMessageStatusDto {
  @IsIn(['PENDING', 'REPLIED', 'ARCHIVED'])
  @IsNotEmpty()
  status: 'PENDING' | 'REPLIED' | 'ARCHIVED';
}

export class ApiResponseDto<T> {
  data: T;
  status: string;
  message: string;
}

export class MessageResponseDto {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'REPLIED' | 'ARCHIVED';
  source: string;
  created_at: string;
  updated_at: string;
}

export class MessageWithRepliesResponseDto extends MessageResponseDto {
  replies: any[];
}

export class ReplyResponseDto {
  id: string;
  message_id: string;
  admin_id: string;
  reply_content: string;
  created_at: string;
}

export class MessageStatsResponseDto {
  total: number;
  pending: number;
  replied: number;
  archived: number;
}

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
