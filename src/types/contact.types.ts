export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  created_at: string;
  updated_at: string;
}

export interface ContactReply {
  id: string;
  message_id: string;
  admin_id: string;
  reply_content: string;
  created_at: string;
  updated_at: string;
}

export type MessageStatus = 'PENDING' | 'REPLIED' | 'ARCHIVED';

export interface ContactMessageWithReply extends ContactMessage {
  replies?: ContactReply[];
}

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}
