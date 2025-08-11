import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ContactService } from '../services/contact.service';
import { EmailService } from '../services/email.service';
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import {
  CreateContactMessageDto,
  CreateReplyDto,
  UpdateMessageStatusDto,
  ContactMessageResponseDto,
  ContactReplyResponseDto,
} from '../dto/contact.dto';
import { ContactMessageWithReply } from '../types/contact.types';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly emailService: EmailService,
  ) {}

  // Public endpoint - no authentication required
  @Post('send-message')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send a contact message',
    description:
      'Public endpoint for users to send contact messages. No authentication required.',
  })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    type: ContactMessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  async sendMessage(
    @Body() createContactMessageDto: CreateContactMessageDto,
  ): Promise<ContactMessageResponseDto> {
    return await this.contactService.createContactMessage(
      createContactMessageDto,
    );
  }

  // Admin-only endpoints - require authentication and admin role
  @Get('messages')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all contact messages',
    description: 'Admin only - Retrieve all contact messages with replies',
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    type: [ContactMessageResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin role required',
  })
  async getAllMessages(): Promise<ContactMessageWithReply[]> {
    return await this.contactService.getAllMessages();
  }

  @Get('messages/:id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a specific contact message',
    description:
      'Admin only - Retrieve a specific contact message with its replies',
  })
  @ApiParam({
    name: 'id',
    description: 'Message ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Message retrieved successfully',
    type: ContactMessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  async getMessageById(
    @Param('id') id: string,
  ): Promise<ContactMessageWithReply> {
    return await this.contactService.getMessageById(id);
  }

  @Post('messages/:id/reply')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Reply to a contact message',
    description:
      'Admin only - Create a reply to a contact message and send it via email',
  })
  @ApiParam({
    name: 'id',
    description: 'Message ID to reply to',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 201,
    description: 'Reply created and sent successfully',
    type: ContactReplyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  async createReply(
    @Param('id') messageId: string,
    @Body() createReplyDto: CreateReplyDto,
    @Request() req: any,
  ): Promise<ContactReplyResponseDto> {
    const adminId = req.user.id;
    return await this.contactService.createReply(
      messageId,
      adminId,
      createReplyDto,
    );
  }

  @Put('messages/:id/status')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update message status',
    description: 'Admin only - Update the status of a contact message',
  })
  @ApiParam({
    name: 'id',
    description: 'Message ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully',
    type: ContactMessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  async updateMessageStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateMessageStatusDto,
  ): Promise<ContactMessageResponseDto> {
    return await this.contactService.updateMessageStatus(id, updateStatusDto);
  }

  @Delete('messages/:id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a contact message',
    description: 'Admin only - Delete a contact message and all its replies',
  })
  @ApiParam({
    name: 'id',
    description: 'Message ID to delete',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 204,
    description: 'Message deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  async deleteMessage(@Param('id') id: string): Promise<void> {
    await this.contactService.deleteMessage(id);
  }

  @Get('messages/status/:status')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get messages by status',
    description: 'Admin only - Retrieve contact messages filtered by status',
  })
  @ApiParam({
    name: 'status',
    description: 'Message status to filter by',
    enum: ['PENDING', 'REPLIED', 'ARCHIVED'],
    example: 'PENDING',
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    type: [ContactMessageResponseDto],
  })
  async getMessagesByStatus(@Param('status') status: string) {
    return await this.contactService.getMessagesByStatus(status as any);
  }

  @Get('stats')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get message statistics',
    description: 'Admin only - Retrieve statistics about contact messages',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        pending: { type: 'number' },
        replied: { type: 'number' },
        archived: { type: 'number' },
      },
    },
  })
  async getMessageStats() {
    return await this.contactService.getMessageStats();
  }
}
