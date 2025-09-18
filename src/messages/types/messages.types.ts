export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface Reply {
  id: string;
  message_id: string;
  admin_id: string;
  reply_content: string;
  created_at: string;
  updated_at: string;
}

export type MessageStatus = 'PENDING' | 'REPLIED' | 'ARCHIVED';

export interface MessageWithReply extends Message {
  replies: Reply[];
}

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}
