import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import {
  Message,
  Reply,
  MessageWithReply,
  MessageStatus,
} from './types/messages.types';
import {
  CreateMessageDto,
  CreateReplyDto,
  UpdateMessageStatusDto,
  ApiResponseDto,
  CONTACT_MESSAGES,
} from './dto/messages.dto';

import { EmailService } from './email.service';

import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly emailService: EmailService,
  ) {}

  async createMessage(
    createMessageDto: CreateMessageDto,
  ): Promise<ApiResponseDto<Message>> {
    try {
      const { data, error } = await this.supabaseService.insert(
        'contact_messages',
        {
          name: createMessageDto.name,
          email: createMessageDto.email,
          subject: createMessageDto.subject,
          message: createMessageDto.message,
          status: 'PENDING' as MessageStatus,
          source: createMessageDto.source || 'portfolio',
        },
      );

      if (error) {
        this.logger.error(`Failed to create contact message: ${error.message}`);
        throw new BadRequestException('Failed to create contact message');
      }

      // Send notification email to admin
      try {
        await this.emailService.sendContactNotification(createMessageDto);
        this.logger.log(
          `Contact notification sent to admin for message from ${createMessageDto.email}`,
        );
      } catch (emailError) {
        this.logger.error(
          `Failed to send contact notification: ${emailError.message}`,
        );
        // Don't fail the whole operation if email fails
      }

      this.logger.log(`Message created from ${createMessageDto.email}`);

      return {
        data,
        status: 'success',
        message: CONTACT_MESSAGES.MESSAGE_CREATED,
      };
    } catch (error) {
      this.logger.error(`Error creating contact message: ${error.message}`);
      throw error;
    }
  }

  async getAllMessages(): Promise<ApiResponseDto<MessageWithReply[]>> {
    try {
      const { data: messages, error: messagesError } =
        await this.supabaseService.select('contact_messages', {
          order: { column: 'created_at', options: { ascending: false } },
        });

      if (messagesError) {
        this.logger.error(`Failed to fetch messages: ${messagesError.message}`);
        throw new BadRequestException('Failed to fetch messages');
      }

      // Fetch replies for each message
      const messagesWithReplies = await Promise.all(
        (messages as Message[]).map(async (message) => {
          const { data: replies } = await this.supabaseService.select(
            'contact_replies',
            {
              eq: { message_id: message.id },
              order: { column: 'created_at', options: { ascending: true } },
            },
          );

          return {
            ...message,
            replies: replies || [],
          };
        }),
      );

      return {
        data: messagesWithReplies,
        status: 'success',
        message: CONTACT_MESSAGES.MESSAGES_RETRIEVED,
      };
    } catch (error) {
      this.logger.error(`Error fetching messages: ${error.message}`);
      throw error;
    }
  }

  async getMessageById(
    messageId: string,
  ): Promise<ApiResponseDto<MessageWithReply>> {
    try {
      const { data: message, error: messageError } =
        await this.supabaseService.select('contact_messages', {
          eq: { id: messageId },
        });

      if (messageError || !message || message.length === 0) {
        throw new NotFoundException('Message not found');
      }

      // Fetch replies for this message
      const { data: replies } = await this.supabaseService.select(
        'contact_replies',
        {
          eq: { message_id: messageId },
          order: { column: 'created_at', options: { ascending: true } },
        },
      );

      const messageWithReplies = {
        ...(message as Message[])[0],
        replies: replies || [],
      };

      return {
        data: messageWithReplies,
        status: 'success',
        message: CONTACT_MESSAGES.MESSAGE_RETRIEVED,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching message ${messageId}: ${error.message}`,
      );
      throw error;
    }
  }

  async createReply(
    messageId: string,
    adminId: string,
    createReplyDto: CreateReplyDto,
  ): Promise<ApiResponseDto<Reply>> {
    try {
      // Verify message exists
      const messageResponse = await this.getMessageById(messageId);
      const message = messageResponse.data;

      // Create reply
      const { data: reply, error: replyError } =
        await this.supabaseService.insert('contact_replies', {
          message_id: messageId,
          admin_id: adminId,
          reply_content: createReplyDto.reply_content,
        });

      if (replyError) {
        this.logger.error(`Failed to create reply: ${replyError.message}`);
        throw new BadRequestException('Failed to create reply');
      }

      // Update message status to REPLIED
      await this.updateMessageStatus(messageId, { status: 'REPLIED' });

      // Send reply email to user
      try {
        await this.emailService.sendReplyToUser(
          message.email,
          message.name,
          message.subject,
          createReplyDto.reply_content,
        );
        this.logger.log(`Reply email sent to user ${message.email}`);
      } catch (emailError) {
        this.logger.error(`Failed to send reply email: ${emailError.message}`);
        // Don't fail the whole operation if email fails
      }

      this.logger.log(
        `Reply created for message ${messageId} by admin ${adminId}`,
      );

      return {
        data: reply,
        status: 'success',
        message: CONTACT_MESSAGES.REPLY_CREATED,
      };
    } catch (error) {
      this.logger.error(`Error creating reply: ${error.message}`);
      throw error;
    }
  }

  async updateMessageStatus(
    messageId: string,
    updateStatusDto: UpdateMessageStatusDto,
  ): Promise<ApiResponseDto<Message>> {
    try {
      const { data, error } = await this.supabaseService.update(
        'contact_messages',
        {
          status: updateStatusDto.status,
          updated_at: new Date().toISOString(),
        },
        { id: messageId },
      );

      if (error || !data) {
        throw new NotFoundException('Message not found');
      }

      this.logger.log(
        `Message ${messageId} status updated to ${updateStatusDto.status}`,
      );

      return {
        data,
        status: 'success',
        message: CONTACT_MESSAGES.STATUS_UPDATED,
      };
    } catch (error) {
      this.logger.error(`Error updating message status: ${error.message}`);
      throw error;
    }
  }

  async deleteMessage(
    messageId: string,
  ): Promise<ApiResponseDto<{ message: string }>> {
    try {
      // Delete replies first (due to foreign key constraint)
      const { error: repliesError } = await this.supabaseService.delete(
        'contact_replies',
        { message_id: messageId },
      );

      if (repliesError) {
        this.logger.error(`Failed to delete replies: ${repliesError.message}`);
        throw new BadRequestException('Failed to delete message replies');
      }

      // Delete the message
      const { error: messageError } = await this.supabaseService.delete(
        'contact_messages',
        { id: messageId },
      );

      if (messageError) {
        this.logger.error(`Failed to delete message: ${messageError.message}`);
        throw new BadRequestException('Failed to delete message');
      }

      this.logger.log(
        `Message ${messageId} and its replies deleted successfully`,
      );

      return {
        data: { message: `Message ${messageId} deleted successfully` },
        status: 'success',
        message: CONTACT_MESSAGES.MESSAGE_DELETED,
      };
    } catch (error) {
      this.logger.error(`Error deleting message: ${error.message}`);
      throw error;
    }
  }

  async getMessagesByStatus(
    status: MessageStatus,
  ): Promise<ApiResponseDto<Message[]>> {
    try {
      const { data, error } = await this.supabaseService.select(
        'contact_messages',
        {
          eq: { status },
          order: { column: 'created_at', options: { ascending: false } },
        },
      );

      if (error) {
        this.logger.error(
          `Failed to fetch messages by status: ${error.message}`,
        );
        throw new BadRequestException('Failed to fetch messages');
      }

      return {
        data: (data as Message[]) || [],
        status: 'success',
        message: CONTACT_MESSAGES.MESSAGES_BY_STATUS,
      };
    } catch (error) {
      this.logger.error(`Error fetching messages by status: ${error.message}`);
      throw error;
    }
  }

  async getMessageStats(): Promise<
    ApiResponseDto<{
      total: number;
      pending: number;
      replied: number;
      archived: number;
    }>
  > {
    try {
      const { data, error } =
        await this.supabaseService.select('contact_messages');

      if (error) {
        this.logger.error(`Failed to fetch message stats: ${error.message}`);
        throw new BadRequestException('Failed to fetch message statistics');
      }

      const messages = data as Message[];
      const stats = {
        total: messages.length,
        pending: messages.filter((msg) => msg.status === 'PENDING').length,
        replied: messages.filter((msg) => msg.status === 'REPLIED').length,
        archived: messages.filter((msg) => msg.status === 'ARCHIVED').length,
      };

      return {
        data: stats,
        status: 'success',
        message: CONTACT_MESSAGES.STATS_RETRIEVED,
      };
    } catch (error) {
      this.logger.error(`Error fetching message stats: ${error.message}`);
      throw error;
    }
  }
}
