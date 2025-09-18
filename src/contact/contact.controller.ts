import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

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
} from './dto/contact.dto';
import { ContactService } from './contact.service';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('send-message')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send a contact message',
    description: 'Allows users to send contact messages through the contact form',
  })
  @ApiBody({
    type: CreateContactMessageDto,
    description: 'Contact message data',
  })
  @ApiCreatedResponse({
    description: 'Contact message sent successfully',
    type: ContactMessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid input data',
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all contact messages (Admin only)',
    description: 'Retrieves all contact messages with their replies. Admin access required.',
  })
  @ApiOkResponse({
    description: 'Contact messages retrieved successfully',
    type: [ContactMessageWithRepliesResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  async getAllMessages(): Promise<
    ApiResponseDto<ContactMessageWithRepliesResponseDto[]>
  > {
    return await this.contactService.getAllMessages();
  }

  @Get('messages/:id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get contact message by ID (Admin only)',
    description: 'Retrieves a specific contact message with its replies by ID. Admin access required.',
  })
  @ApiParam({
    name: 'id',
    description: 'Contact message unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Contact message retrieved successfully',
    type: ContactMessageWithRepliesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Contact message not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  async getMessageById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<ContactMessageWithRepliesResponseDto>> {
    return await this.contactService.getMessageById(id);
  }

  @Post('messages/:id/reply')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Reply to a contact message (Admin only)',
    description: 'Creates a reply to a specific contact message. Admin access required.',
  })
  @ApiParam({
    name: 'id',
    description: 'Contact message unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: CreateReplyDto,
    description: 'Reply message data',
  })
  @ApiCreatedResponse({
    description: 'Reply created successfully',
    type: ContactReplyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Contact message not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update message status (Admin only)',
    description: 'Updates the status of a contact message (PENDING, REPLIED, ARCHIVED). Admin access required.',
  })
  @ApiParam({
    name: 'id',
    description: 'Contact message unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateMessageStatusDto,
    description: 'New status for the message',
  })
  @ApiOkResponse({
    description: 'Message status updated successfully',
    type: ContactMessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Contact message not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
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
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a contact message (Admin only)',
    description: 'Permanently deletes a contact message and all its replies. Admin access required.',
  })
  @ApiParam({
    name: 'id',
    description: 'Contact message unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiNoContentResponse({
    description: 'Contact message deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Contact message not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  async deleteMessage(
    @Param('id') messageId: string,
  ): Promise<ApiResponseDto<{ message: string }>> {
    return await this.contactService.deleteMessage(messageId);
  }

  @Get('messages/status/:status')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get messages by status (Admin only)',
    description: 'Retrieves contact messages filtered by status (PENDING, REPLIED, ARCHIVED). Admin access required.',
  })
  @ApiParam({
    name: 'status',
    description: 'Message status to filter by',
    enum: ['PENDING', 'REPLIED', 'ARCHIVED'],
    example: 'PENDING',
  })
  @ApiOkResponse({
    description: 'Contact messages retrieved successfully',
    type: [ContactMessageResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid status value',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  async getMessagesByStatus(
    @Param('status') status: 'PENDING' | 'REPLIED' | 'ARCHIVED',
  ): Promise<ApiResponseDto<ContactMessageResponseDto[]>> {
    return await this.contactService.getMessagesByStatus(status);
  }

  @Get('stats')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get message statistics (Admin only)',
    description: 'Retrieves statistics about contact messages (total, by status, etc.). Admin access required.',
  })
  @ApiOkResponse({
    description: 'Message statistics retrieved successfully',
    type: MessageStatsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  async getMessageStats(): Promise<ApiResponseDto<MessageStatsResponseDto>> {
    return await this.contactService.getMessageStats();
  }
}
