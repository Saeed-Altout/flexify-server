import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '../auth/types/auth.types';
import {
  CreateMessageDto,
  CreateReplyDto,
  UpdateMessageStatusDto,
  MessageQueryDto,
  MessageDto,
  MessageReplyDto,
  MessageWithRepliesDto,
  MessageListResponseDto,
  MessageStatsDto,
  StandardResponseDto,
} from './dto/messages.dto';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send Message',
    description: 'Send a new message (public endpoint)',
  })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/MessageDto' },
        message: { type: 'string', example: 'Message sent successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async sendMessage(
    @Body() createDto: CreateMessageDto,
    @Request() req: any,
  ): Promise<StandardResponseDto<MessageDto>> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.messagesService.createMessage(createDto, ipAddress, userAgent);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Messages',
    description: 'Get a paginated list of messages (Admin only)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'user_id',
    required: false,
    description: 'Filter by user ID',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sort_by', required: false, description: 'Sort by field' })
  @ApiQuery({ name: 'sort_order', required: false, description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/MessageListResponseDto' },
        message: { type: 'string', example: 'Messages retrieved successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getMessages(
    @Query() query: MessageQueryDto,
  ): Promise<StandardResponseDto<MessageListResponseDto>> {
    return this.messagesService.getMessages(query);
  }

  @Get('stats')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Message Statistics',
    description: 'Get message statistics and analytics (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Message statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/MessageStatsDto' },
        message: {
          type: 'string',
          example: 'Message statistics retrieved successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getMessageStats(): Promise<StandardResponseDto<MessageStatsDto>> {
    return this.messagesService.getMessageStats();
  }

  @Get('search')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search Messages',
    description: 'Search messages by name, email, or subject (Admin only)',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/MessageListResponseDto' },
        message: {
          type: 'string',
          example: 'Search results retrieved successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async searchMessages(
    @Query('q') searchTerm: string,
    @Query() query: MessageQueryDto,
  ): Promise<StandardResponseDto<MessageListResponseDto>> {
    return this.messagesService.searchMessages(searchTerm, query);
  }

  @Get('status/:status')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Messages by Status',
    description: 'Get messages filtered by status (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/MessageListResponseDto' },
        message: { type: 'string', example: 'Messages retrieved successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getMessagesByStatus(
    @Param('status') status: string,
    @Query() query: MessageQueryDto,
  ): Promise<StandardResponseDto<MessageListResponseDto>> {
    return this.messagesService.getMessagesByStatus(status, query);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Message by ID',
    description: 'Get a specific message by its ID (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Message retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/MessageDto' },
        message: { type: 'string', example: 'Message retrieved successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  async getMessageById(
    @Param('id') id: string,
  ): Promise<StandardResponseDto<MessageDto>> {
    return this.messagesService.getMessageById(id);
  }

  @Get(':id/with-replies')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Message with Replies',
    description: 'Get a message with all its replies (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Message with replies retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/MessageWithRepliesDto' },
        message: {
          type: 'string',
          example: 'Message with replies retrieved successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  async getMessageWithReplies(
    @Param('id') id: string,
  ): Promise<StandardResponseDto<MessageWithRepliesDto>> {
    return this.messagesService.getMessageWithReplies(id);
  }

  @Put(':id/status')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Message Status',
    description: 'Update message status (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Message status updated successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/MessageDto' },
        message: {
          type: 'string',
          example: 'Message status updated successfully',
        },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  async updateMessageStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateMessageStatusDto,
  ): Promise<StandardResponseDto<MessageDto>> {
    return this.messagesService.updateMessageStatus(id, updateDto);
  }

  @Post(':id/reply')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reply to Message',
    description: 'Send a reply to a message (Admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Reply sent successfully',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/MessageReplyDto' },
        message: { type: 'string', example: 'Reply sent successfully' },
        status: { type: 'string', example: 'success' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  async replyToMessage(
    @Param('id') id: string,
    @Body() createDto: CreateReplyDto,
    @CurrentUser() user: User,
  ): Promise<StandardResponseDto<MessageReplyDto>> {
    return this.messagesService.createReply(id, createDto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Message',
    description: 'Delete a message (Admin only)',
  })
  @ApiResponse({
    status: 204,
    description: 'Message deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
  })
  async deleteMessage(
    @Param('id') id: string,
  ): Promise<StandardResponseDto<null>> {
    return this.messagesService.deleteMessage(id);
  }
}
