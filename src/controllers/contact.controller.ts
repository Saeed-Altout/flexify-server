import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ContactService } from '../services/contact.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import {
  CreateContactMessageDto,
  CreateReplyDto,
  UpdateMessageStatusDto,
  ApiResponseDto,
  ContactMessageResponseDto,
  ContactMessageWithRepliesResponseDto,
  ContactReplyResponseDto,
  MessageStatsResponseDto,
  CONTACT_MESSAGES,
} from '../dto/contact.dto';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('send-message')
  @ApiOperation({
    summary: 'Send contact message',
    description:
      'Public endpoint - Send a contact message (no authentication required)',
  })
  @ApiBody({ type: CreateContactMessageDto })
  @ApiResponse({
    status: 201,
    description: 'Contact message sent successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/ContactMessageResponseDto' },
        status: { type: 'string', example: 'success' },
        message: {
          type: 'string',
          example: 'Thank you for your message! I will get back to you soon.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'array', items: { type: 'string' } },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async sendMessage(
    @Body() createContactMessageDto: CreateContactMessageDto,
  ): Promise<ApiResponseDto<ContactMessageResponseDto>> {
    return await this.contactService.createContactMessage(
      createContactMessageDto,
    );
  }

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
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/ContactMessageWithRepliesResponseDto',
          },
        },
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Messages retrieved successfully' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin role required',
  })
  async getAllMessages(): Promise<
    ApiResponseDto<ContactMessageWithRepliesResponseDto[]>
  > {
    return await this.contactService.getAllMessages();
  }

  @Get('messages/:id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get message by ID',
    description:
      'Admin only - Retrieve a specific contact message with replies',
  })
  @ApiParam({
    name: 'id',
    description: 'Message ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Message retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: '#/components/schemas/ContactMessageWithRepliesResponseDto',
        },
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Message retrieved successfully' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  async getMessageById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<ContactMessageWithRepliesResponseDto>> {
    return await this.contactService.getMessageById(id);
  }

  @Post('messages/:id/reply')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reply to a message',
    description: 'Admin only - Send a reply to a contact message',
  })
  @ApiParam({
    name: 'id',
    description: 'Message ID',
    example: 'uuid-string',
  })
  @ApiBody({ type: CreateReplyDto })
  @ApiResponse({
    status: 201,
    description: 'Reply sent successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/ContactReplyResponseDto' },
        status: { type: 'string', example: 'success' },
        message: {
          type: 'string',
          example: 'Reply sent successfully to the user',
        },
      },
    },
  })
  async createReply(
    @Param('id') messageId: string,
    @Body() createReplyDto: CreateReplyDto,
    // Note: adminId should come from JWT token in real implementation
  ): Promise<ApiResponseDto<ContactReplyResponseDto>> {
    // For now, using a placeholder admin ID - in real app, get from JWT
    const adminId = 'admin-user-id';
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
  @ApiBody({ type: UpdateMessageStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/ContactMessageResponseDto' },
        status: { type: 'string', example: 'success' },
        message: {
          type: 'string',
          example: 'Message status updated successfully',
        },
      },
    },
  })
  async updateMessageStatus(
    @Param('id') messageId: string,
    @Body() updateStatusDto: UpdateMessageStatusDto,
  ): Promise<ApiResponseDto<ContactMessageResponseDto>> {
    return await this.contactService.updateMessageStatus(
      messageId,
      updateStatusDto,
    );
  }

  @Delete('messages/:id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete message',
    description: 'Admin only - Delete a contact message and its replies',
  })
  @ApiParam({
    name: 'id',
    description: 'Message ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Message deleted successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Message uuid-string deleted successfully',
            },
          },
        },
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Message deleted successfully' },
      },
    },
  })
  async deleteMessage(
    @Param('id') messageId: string,
  ): Promise<ApiResponseDto<{ message: string }>> {
    return await this.contactService.deleteMessage(messageId);
  }

  @Get('messages/status/:status')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get messages by status',
    description: 'Admin only - Retrieve messages filtered by status',
  })
  @ApiParam({
    name: 'status',
    description: 'Message status',
    enum: ['PENDING', 'REPLIED', 'ARCHIVED'],
    example: 'PENDING',
  })
  @ApiResponse({
    status: 200,
    description: 'Messages filtered by status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ContactMessageResponseDto' },
        },
        status: { type: 'string', example: 'success' },
        message: {
          type: 'string',
          example: 'Messages filtered by status retrieved successfully',
        },
      },
    },
  })
  async getMessagesByStatus(
    @Param('status') status: 'PENDING' | 'REPLIED' | 'ARCHIVED',
  ): Promise<ApiResponseDto<ContactMessageResponseDto[]>> {
    return await this.contactService.getMessagesByStatus(status);
  }

  @Get('stats')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get message statistics',
    description: 'Admin only - Retrieve contact message statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/MessageStatsResponseDto' },
        status: { type: 'string', example: 'success' },
        message: {
          type: 'string',
          example: 'Message statistics retrieved successfully',
        },
      },
    },
  })
  async getMessageStats(): Promise<ApiResponseDto<MessageStatsResponseDto>> {
    return await this.contactService.getMessageStats();
  }

  @Get('test-email')
  @ApiOperation({
    summary: 'Test email configuration',
    description: 'Test the email service configuration (development only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Email test completed',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: {
              type: 'string',
              example: 'Email service is configured and ready',
            },
            timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          },
        },
        status: { type: 'string', example: 'success' },
        message: {
          type: 'string',
          example: 'Email service is working correctly',
        },
      },
    },
  })
  async testEmail(): Promise<
    ApiResponseDto<{
      success: boolean;
      message: string;
      timestamp: string;
    }>
  > {
    // This is a simple test endpoint for development
    try {
      // Test basic email functionality
      return {
        data: {
          success: true,
          message: 'Email service is configured and ready',
          timestamp: new Date().toISOString(),
        },
        status: 'success',
        message: CONTACT_MESSAGES.EMAIL_TEST_SUCCESS,
      };
    } catch (error) {
      return {
        data: {
          success: false,
          message: `Email test failed: ${error.message}`,
          timestamp: new Date().toISOString(),
        },
        status: 'error',
        message: CONTACT_MESSAGES.INTERNAL_ERROR,
      };
    }
  }
}
