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
  CreateMessageDto,
  CreateReplyDto,
  UpdateMessageStatusDto,
  ApiResponseDto,
  MessageResponseDto,
  MessageWithRepliesResponseDto,
  ReplyResponseDto,
  MessageStatsResponseDto,
} from './dto/messages.dto';
import { MessagesService } from './messages.service';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send a message',
    description: 'Allows users to send messages through the contact form',
  })
  @ApiBody({
    type: CreateMessageDto,
    description: 'Message data',
  })
  @ApiCreatedResponse({
    description: 'Message sent successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid input data',
  })
  async sendMessage(
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<ApiResponseDto<MessageResponseDto>> {
    return await this.messagesService.createMessage(createMessageDto);
  }

  @Get()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all messages (Admin only)',
    description:
      'Retrieves all messages with their replies. Admin access required.',
  })
  @ApiOkResponse({
    description: 'Messages retrieved successfully',
    type: [MessageWithRepliesResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  async getAllMessages(): Promise<
    ApiResponseDto<MessageWithRepliesResponseDto[]>
  > {
    return await this.messagesService.getAllMessages();
  }

  @Get(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get message by ID (Admin only)',
    description:
      'Retrieves a specific message with its replies by ID. Admin access required.',
  })
  @ApiParam({
    name: 'id',
    description: 'Message unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Message retrieved successfully',
    type: MessageWithRepliesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  async getMessageById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<MessageWithRepliesResponseDto>> {
    return await this.messagesService.getMessageById(id);
  }

  @Post(':id/reply')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Reply to a message (Admin only)',
    description:
      'Creates a reply to a specific message. Admin access required.',
  })
  @ApiParam({
    name: 'id',
    description: 'Message unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: CreateReplyDto,
    description: 'Reply message data',
  })
  @ApiCreatedResponse({
    description: 'Reply created successfully',
    type: ReplyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  async createReply(
    @Param('id') messageId: string,
    @Body() createReplyDto: CreateReplyDto,
    // Note: adminId should come from JWT token in real implementation
  ): Promise<ApiResponseDto<ReplyResponseDto>> {
    // For now, using a placeholder admin ID - in real app, get from JWT
    const adminId = 'admin-user-id';
    return await this.messagesService.createReply(
      messageId,
      adminId,
      createReplyDto,
    );
  }

  @Put(':id/status')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update message status (Admin only)',
    description:
      'Updates the status of a message (PENDING, REPLIED, ARCHIVED). Admin access required.',
  })
  @ApiParam({
    name: 'id',
    description: 'Message unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateMessageStatusDto,
    description: 'New status for the message',
  })
  @ApiOkResponse({
    description: 'Message status updated successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  async updateMessageStatus(
    @Param('id') messageId: string,
    @Body() updateStatusDto: UpdateMessageStatusDto,
  ): Promise<ApiResponseDto<MessageResponseDto>> {
    return await this.messagesService.updateMessageStatus(
      messageId,
      updateStatusDto,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a message (Admin only)',
    description:
      'Permanently deletes a message and all its replies. Admin access required.',
  })
  @ApiParam({
    name: 'id',
    description: 'Message unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiNoContentResponse({
    description: 'Message deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
  })
  async deleteMessage(
    @Param('id') messageId: string,
  ): Promise<ApiResponseDto<{ message: string }>> {
    return await this.messagesService.deleteMessage(messageId);
  }

  @Get('status/:status')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get messages by status (Admin only)',
    description:
      'Retrieves messages filtered by status (PENDING, REPLIED, ARCHIVED). Admin access required.',
  })
  @ApiParam({
    name: 'status',
    description: 'Message status to filter by',
    enum: ['PENDING', 'REPLIED', 'ARCHIVED'],
    example: 'PENDING',
  })
  @ApiOkResponse({
    description: 'Messages retrieved successfully',
    type: [MessageResponseDto],
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
  ): Promise<ApiResponseDto<MessageResponseDto[]>> {
    return await this.messagesService.getMessagesByStatus(status);
  }

  @Get('stats')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get message statistics (Admin only)',
    description:
      'Retrieves statistics about messages (total, by status, etc.). Admin access required.',
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
    return await this.messagesService.getMessageStats();
  }
}
