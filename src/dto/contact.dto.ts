import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactMessageDto {
  @ApiProperty({
    description: 'Name of the person sending the message',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Email address of the sender',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Subject of the message',
    example: 'Project Inquiry',
    minLength: 5,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  subject: string;

  @ApiProperty({
    description: 'Content of the message',
    example: 'I would like to discuss a potential project with you.',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  message: string;
}

export class CreateReplyDto {
  @ApiProperty({
    description: 'Content of the reply message',
    example: 'Thank you for your message. I will get back to you soon.',
    minLength: 5,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(2000)
  reply_content: string;
}

export class UpdateMessageStatusDto {
  @ApiProperty({
    description: 'New status for the message',
    enum: ['PENDING', 'REPLIED', 'ARCHIVED'],
    example: 'REPLIED',
  })
  @IsString()
  @IsNotEmpty()
  status: 'PENDING' | 'REPLIED' | 'ARCHIVED';
}

export class ContactMessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;
}

export class ContactReplyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  message_id: string;

  @ApiProperty()
  admin_id: string;

  @ApiProperty()
  reply_content: string;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;
}
