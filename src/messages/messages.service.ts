import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  Message,
  MessageReply,
  CreateMessageRequest,
  CreateReplyRequest,
  UpdateMessageStatusRequest,
  MessageQuery,
  MessageListResponse,
  MessageWithReplies,
  MessageStats,
} from './types/messages.types';
import {
  StandardResponseDto,
  MessageListResponseDto,
  MessageStatsDto,
  MessageDto,
  MessageWithRepliesDto,
  MessageReplyDto,
  MessageStatusEnum,
} from './dto/messages.dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(private supabaseService: SupabaseService) {}

  // =====================================================
  // CONVERSION FUNCTIONS
  // =====================================================

  private convertMessageToDto(message: Message): MessageDto {
    return {
      id: message.id,
      name: message.name,
      email: message.email,
      subject: message.subject,
      message: message.message,
      status: message.status as MessageStatusEnum,
      user_id: message.user_id,
      ip_address: message.ip_address,
      user_agent: message.user_agent,
      created_at: message.created_at,
      updated_at: message.updated_at,
    };
  }

  private convertMessageReplyToDto(reply: MessageReply): MessageReplyDto {
    return {
      id: reply.id,
      message_id: reply.message_id,
      user_id: reply.user_id,
      reply: reply.reply,
      created_at: reply.created_at,
      updated_at: reply.updated_at,
    };
  }

  private convertMessageWithRepliesToDto(messageWithReplies: MessageWithReplies): MessageWithRepliesDto {
    return {
      ...this.convertMessageToDto(messageWithReplies),
      replies: messageWithReplies.replies.map(reply => this.convertMessageReplyToDto(reply)),
    };
  }

  private convertMessageListResponseToDto(response: MessageListResponse): MessageListResponseDto {
    return {
      messages: response.messages.map(message => this.convertMessageToDto(message)),
      total: response.total,
      page: response.page,
      limit: response.limit,
      total_pages: response.total_pages,
    };
  }

  // =====================================================
  // MESSAGE OPERATIONS
  // =====================================================

  async createMessage(
    createDto: CreateMessageRequest,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<StandardResponseDto<MessageDto>> {
    try {
      this.logger.log(`Creating message from: ${createDto.email}`);

      const { data, error } = await this.supabaseService.insert('messages', {
        name: createDto.name,
        email: createDto.email,
        subject: createDto.subject,
        message: createDto.message,
        status: 'unread',
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      if (error) {
        this.logger.error(`Error creating message: ${error.message}`);
        throw new BadRequestException(
          `Failed to create message: ${error.message}`,
        );
      }

      this.logger.log(`Successfully created message: ${data.id}`);

      return {
        data: this.convertMessageToDto(data),
        message: 'Message sent successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in createMessage: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getMessages(
    query: MessageQuery,
  ): Promise<StandardResponseDto<MessageListResponseDto>> {
    try {
      this.logger.log('Fetching messages with query:', query);

      let supabaseQuery = this.supabaseService.supabase
        .from('messages')
        .select('*', { count: 'exact' });

      // Apply filters
      if (query.status) {
        supabaseQuery = supabaseQuery.eq('status', query.status);
      }

      if (query.user_id) {
        supabaseQuery = supabaseQuery.eq('user_id', query.user_id);
      }

      if (query.search) {
        supabaseQuery = supabaseQuery.or(
          `name.ilike.%${query.search}%,email.ilike.%${query.search}%,subject.ilike.%${query.search}%,message.ilike.%${query.search}%`,
        );
      }

      // Apply sorting
      const sortBy = query.sort_by || 'created_at';
      const sortOrder = query.sort_order || 'desc';
      supabaseQuery = supabaseQuery.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const page = query.page || 1;
      const limit = query.limit || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      supabaseQuery = supabaseQuery.range(from, to);

      const { data, error, count } = await supabaseQuery;

      if (error) {
        this.logger.error(`Error fetching messages: ${error.message}`);
        throw new BadRequestException(
          `Failed to fetch messages: ${error.message}`,
        );
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      const response: MessageListResponse = {
        messages: data || [],
        total,
        page,
        limit,
        total_pages: totalPages,
      };

      this.logger.log(`Successfully fetched ${data?.length || 0} messages`);

      return {
        data: this.convertMessageListResponseToDto(response),
        message: 'Messages retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getMessages: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getMessageById(id: string): Promise<StandardResponseDto<MessageDto>> {
    try {
      this.logger.log(`Fetching message with ID: ${id}`);

      const { data, error } = await this.supabaseService.select('messages', {
        eq: { id },
      });

      if (error) {
        this.logger.error(`Error fetching message: ${error.message}`);
        throw new BadRequestException(
          `Failed to fetch message: ${error.message}`,
        );
      }

      if (!data || data.length === 0) {
        throw new NotFoundException(`Message with ID ${id} not found`);
      }

      this.logger.log(`Successfully fetched message: ${id}`);

      return {
        data: this.convertMessageToDto(data[0]),
        message: 'Message retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getMessageById: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getMessageWithReplies(
    id: string,
  ): Promise<StandardResponseDto<MessageWithRepliesDto>> {
    try {
      this.logger.log(`Fetching message with replies for ID: ${id}`);

      // Get the message
      const { data: messageData, error: messageError } = await this.supabaseService.select('messages', {
        eq: { id },
      });

      if (messageError) {
        this.logger.error(`Error fetching message: ${messageError.message}`);
        throw new BadRequestException(
          `Failed to fetch message: ${messageError.message}`,
        );
      }

      if (!messageData || messageData.length === 0) {
        throw new NotFoundException(`Message with ID ${id} not found`);
      }

      // Get the replies
      const { data: repliesData, error: repliesError } = await this.supabaseService.select('message_replies', {
        eq: { message_id: id },
      });

      if (repliesError) {
        this.logger.error(`Error fetching replies: ${repliesError.message}`);
        throw new BadRequestException(
          `Failed to fetch replies: ${repliesError.message}`,
        );
      }

      const messageWithReplies: MessageWithReplies = {
        ...messageData[0],
        replies: repliesData || [],
      };

      this.logger.log(`Successfully fetched message with ${repliesData?.length || 0} replies`);

      return {
        data: this.convertMessageWithRepliesToDto(messageWithReplies),
        message: 'Message with replies retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getMessageWithReplies: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async updateMessageStatus(
    id: string,
    updateDto: UpdateMessageStatusRequest,
  ): Promise<StandardResponseDto<MessageDto>> {
    try {
      this.logger.log(`Updating message status for ID: ${id}`);

      const { data, error } = await this.supabaseService.update('messages', {
        status: updateDto.status,
      }, { id });

      if (error) {
        this.logger.error(`Error updating message status: ${error.message}`);
        throw new BadRequestException(
          `Failed to update message status: ${error.message}`,
        );
      }

      if (!data || data.length === 0) {
        throw new NotFoundException(`Message with ID ${id} not found`);
      }

      this.logger.log(`Successfully updated message status: ${id}`);

      return {
        data: this.convertMessageToDto(data[0]),
        message: 'Message status updated successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in updateMessageStatus: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  // =====================================================
  // REPLY OPERATIONS
  // =====================================================

  async createReply(
    messageId: string,
    createDto: CreateReplyRequest,
    userId: string,
  ): Promise<StandardResponseDto<MessageReplyDto>> {
    try {
      this.logger.log(`Creating reply for message ID: ${messageId}`);

      // Check if message exists
      const { data: messageData, error: messageError } = await this.supabaseService.select('messages', {
        eq: { id: messageId },
      });

      if (messageError) {
        this.logger.error(`Error checking message: ${messageError.message}`);
        throw new BadRequestException(
          `Failed to check message: ${messageError.message}`,
        );
      }

      if (!messageData || messageData.length === 0) {
        throw new NotFoundException(`Message with ID ${messageId} not found`);
      }

      // Create the reply
      const { data, error } = await this.supabaseService.insert('message_replies', {
        message_id: messageId,
        user_id: userId,
        reply: createDto.reply,
      });

      if (error) {
        this.logger.error(`Error creating reply: ${error.message}`);
        throw new BadRequestException(
          `Failed to create reply: ${error.message}`,
        );
      }

      // Update message status to 'replied'
      await this.updateMessageStatus(messageId, { status: 'replied' });

      this.logger.log(`Successfully created reply: ${data.id}`);

      return {
        data: this.convertMessageReplyToDto(data),
        message: 'Reply created successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in createReply: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  // =====================================================
  // STATISTICS
  // =====================================================

  async getMessageStats(): Promise<StandardResponseDto<MessageStatsDto>> {
    try {
      this.logger.log('Fetching message statistics');

      // Get total messages
      const { count: total, error: totalError } = await this.supabaseService.supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        this.logger.error(`Error fetching total messages: ${totalError.message}`);
        throw new BadRequestException(
          `Failed to fetch total messages: ${totalError.message}`,
        );
      }

      // Get unread messages
      const { count: unread, error: unreadError } = await this.supabaseService.supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread');

      if (unreadError) {
        this.logger.error(`Error fetching unread messages: ${unreadError.message}`);
        throw new BadRequestException(
          `Failed to fetch unread messages: ${unreadError.message}`,
        );
      }

      // Get read messages
      const { count: read, error: readError } = await this.supabaseService.supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'read');

      if (readError) {
        this.logger.error(`Error fetching read messages: ${readError.message}`);
        throw new BadRequestException(
          `Failed to fetch read messages: ${readError.message}`,
        );
      }

      // Get replied messages
      const { count: replied, error: repliedError } = await this.supabaseService.supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'replied');

      if (repliedError) {
        this.logger.error(`Error fetching replied messages: ${repliedError.message}`);
        throw new BadRequestException(
          `Failed to fetch replied messages: ${repliedError.message}`,
        );
      }

      // Get today's messages
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayCount, error: todayError } = await this.supabaseService.supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      if (todayError) {
        this.logger.error(`Error fetching today's messages: ${todayError.message}`);
        throw new BadRequestException(
          `Failed to fetch today's messages: ${todayError.message}`,
        );
      }

      // Get this week's messages
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: weekCount, error: weekError } = await this.supabaseService.supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      if (weekError) {
        this.logger.error(`Error fetching this week's messages: ${weekError.message}`);
        throw new BadRequestException(
          `Failed to fetch this week's messages: ${weekError.message}`,
        );
      }

      // Get this month's messages
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const { count: monthCount, error: monthError } = await this.supabaseService.supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthAgo.toISOString());

      if (monthError) {
        this.logger.error(`Error fetching this month's messages: ${monthError.message}`);
        throw new BadRequestException(
          `Failed to fetch this month's messages: ${monthError.message}`,
        );
      }

      const stats: MessageStats = {
        total: total || 0,
        unread: unread || 0,
        read: read || 0,
        replied: replied || 0,
        today: todayCount || 0,
        this_week: weekCount || 0,
        this_month: monthCount || 0,
      };

      this.logger.log('Successfully fetched message statistics');

      return {
        data: stats,
        message: 'Message statistics retrieved successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getMessageStats: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  // =====================================================
  // ADMIN OPERATIONS
  // =====================================================

  async deleteMessage(id: string): Promise<StandardResponseDto<null>> {
    try {
      this.logger.log(`Deleting message with ID: ${id}`);

      const { error } = await this.supabaseService.delete('messages', { id });

      if (error) {
        this.logger.error(`Error deleting message: ${error.message}`);
        throw new BadRequestException(
          `Failed to delete message: ${error.message}`,
        );
      }

      this.logger.log(`Successfully deleted message: ${id}`);

      return {
        data: null,
        message: 'Message deleted successfully',
        status: 'success',
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in deleteMessage: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async getMessagesByStatus(
    status: string,
    query: MessageQuery,
  ): Promise<StandardResponseDto<MessageListResponseDto>> {
    try {
      this.logger.log(`Fetching messages with status: ${status}`);

      const queryWithStatus = { ...query, status: status as any };
      return this.getMessages(queryWithStatus);
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in getMessagesByStatus: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  async searchMessages(
    searchTerm: string,
    query: MessageQuery,
  ): Promise<StandardResponseDto<MessageListResponseDto>> {
    try {
      this.logger.log(`Searching messages with term: ${searchTerm}`);

      const queryWithSearch = { ...query, search: searchTerm };
      return this.getMessages(queryWithSearch);
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Error in searchMessages: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
}