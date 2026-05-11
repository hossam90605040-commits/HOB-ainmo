/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  USER = 'user',
  PREMIUM = 'premium',
  ADMIN = 'admin'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  createdAt: number;
  lastActive: number;
}

export interface Attachment {
  url: string; // Base64 or URL
  type: string; // mimeType
  name: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  model?: string;
  isEdited?: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  model: string;
  messagesCount: number;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: 'gemini' | 'openai' | 'claude';
  capabilities: string[];
  premiumOnly: boolean;
}
