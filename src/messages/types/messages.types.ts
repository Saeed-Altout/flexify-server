export type MessageStatus = 'unread' | 'read' | 'replied' | 'archived';

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface MessageReply {
  id: string;
  message_id: string;
  user_id: string;
  reply: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMessageRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface CreateReplyRequest {
  reply: string;
}

export interface UpdateMessageStatusRequest {
  status: MessageStatus;
}

export interface MessageQuery {
  status?: MessageStatus;
  user_id?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'email' | 'status' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface MessageWithReplies extends Message {
  replies: MessageReply[];
}

export interface MessageStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
  today: number;
  this_week: number;
  this_month: number;
}
