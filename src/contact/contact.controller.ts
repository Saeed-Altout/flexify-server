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

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('send-message')
  async sendMessage(
    @Body() createContactMessageDto: CreateContactMessageDto,
  ): Promise<ApiResponseDto<ContactMessageResponseDto>> {
    return await this.contactService.createContactMessage(
      createContactMessageDto,
    );
  }

  @Get('messages')
  @UseGuards(AuthGuard, AdminGuard)
  async getAllMessages(): Promise<
    ApiResponseDto<ContactMessageWithRepliesResponseDto[]>
  > {
    return await this.contactService.getAllMessages();
  }

  @Get('messages/:id')
  @UseGuards(AuthGuard, AdminGuard)
  async getMessageById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<ContactMessageWithRepliesResponseDto>> {
    return await this.contactService.getMessageById(id);
  }

  @Post('messages/:id/reply')
  @UseGuards(AuthGuard, AdminGuard)
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
  async deleteMessage(
    @Param('id') messageId: string,
  ): Promise<ApiResponseDto<{ message: string }>> {
    return await this.contactService.deleteMessage(messageId);
  }

  @Get('messages/status/:status')
  @UseGuards(AuthGuard, AdminGuard)
  async getMessagesByStatus(
    @Param('status') status: 'PENDING' | 'REPLIED' | 'ARCHIVED',
  ): Promise<ApiResponseDto<ContactMessageResponseDto[]>> {
    return await this.contactService.getMessagesByStatus(status);
  }

  @Get('stats')
  @UseGuards(AuthGuard, AdminGuard)
  async getMessageStats(): Promise<ApiResponseDto<MessageStatsResponseDto>> {
    return await this.contactService.getMessageStats();
  }
}
