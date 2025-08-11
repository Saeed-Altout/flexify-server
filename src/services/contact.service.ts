import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { EmailService } from './email.service';
import {
  ContactMessage,
  ContactReply,
  ContactMessageWithReply,
  MessageStatus,
} from '../types/contact.types';
import {
  CreateContactMessageDto,
  CreateReplyDto,
  UpdateMessageStatusDto,
} from '../dto/contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly emailService: EmailService,
  ) {}

  async createContactMessage(
    createContactMessageDto: CreateContactMessageDto,
  ): Promise<ContactMessage> {
    try {
      const { data, error } = await this.supabaseService.insert(
        'contact_messages',
        {
          name: createContactMessageDto.name,
          email: createContactMessageDto.email,
          subject: createContactMessageDto.subject,
          message: createContactMessageDto.message,
          status: 'PENDING' as MessageStatus,
        },
      );

      if (error) {
        this.logger.error(`Failed to create contact message: ${error.message}`);
        throw new BadRequestException('Failed to create contact message');
      }

      // Send notification email to admin
      await this.emailService.sendContactNotification(createContactMessageDto);

      this.logger.log(
        `Contact message created from ${createContactMessageDto.email}`,
      );
      return data;
    } catch (error) {
      this.logger.error(`Error creating contact message: ${error.message}`);
      throw error;
    }
  }

  async getAllMessages(): Promise<ContactMessageWithReply[]> {
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
        (messages as ContactMessage[]).map(async (message) => {
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

      return messagesWithReplies;
    } catch (error) {
      this.logger.error(`Error fetching messages: ${error.message}`);
      throw error;
    }
  }

  async getMessageById(messageId: string): Promise<ContactMessageWithReply> {
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

      return {
        ...(message as ContactMessage[])[0],
        replies: replies || [],
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
  ): Promise<ContactReply> {
    try {
      // Verify message exists
      const message = await this.getMessageById(messageId);
      if (!message) {
        throw new NotFoundException('Message not found');
      }

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
      await this.emailService.sendReplyToUser(
        message.email,
        message.name,
        message.subject,
        createReplyDto.reply_content,
      );

      this.logger.log(
        `Reply created for message ${messageId} by admin ${adminId}`,
      );
      return reply;
    } catch (error) {
      this.logger.error(`Error creating reply: ${error.message}`);
      throw error;
    }
  }

  async updateMessageStatus(
    messageId: string,
    updateStatusDto: UpdateMessageStatusDto,
  ): Promise<ContactMessage> {
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
      return data;
    } catch (error) {
      this.logger.error(`Error updating message status: ${error.message}`);
      throw error;
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
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
    } catch (error) {
      this.logger.error(`Error deleting message: ${error.message}`);
      throw error;
    }
  }

  async getMessagesByStatus(status: MessageStatus): Promise<ContactMessage[]> {
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

      return (data as ContactMessage[]) || [];
    } catch (error) {
      this.logger.error(`Error fetching messages by status: ${error.message}`);
      throw error;
    }
  }

  async getMessageStats(): Promise<{
    total: number;
    pending: number;
    replied: number;
    archived: number;
  }> {
    try {
      const { data, error } =
        await this.supabaseService.select('contact_messages');

      if (error) {
        this.logger.error(`Failed to fetch message stats: ${error.message}`);
        throw new BadRequestException('Failed to fetch message statistics');
      }

      const messages = data as ContactMessage[];
      const stats = {
        total: messages.length,
        pending: messages.filter((msg) => msg.status === 'PENDING').length,
        replied: messages.filter((msg) => msg.status === 'REPLIED').length,
        archived: messages.filter((msg) => msg.status === 'ARCHIVED').length,
      };

      return stats;
    } catch (error) {
      this.logger.error(`Error fetching message stats: ${error.message}`);
      throw error;
    }
  }
}
