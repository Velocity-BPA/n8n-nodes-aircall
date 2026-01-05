/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export type AircallResource =
  | 'call'
  | 'user'
  | 'number'
  | 'contact'
  | 'team'
  | 'tag'
  | 'webhook'
  | 'message'
  | 'company'
  | 'integration';

export type CallOperation =
  | 'get'
  | 'getAll'
  | 'search'
  | 'link'
  | 'transfer'
  | 'addComment'
  | 'addTag'
  | 'removeTag'
  | 'delete'
  | 'getInsights'
  | 'getRecording';

export type UserOperation =
  | 'create'
  | 'get'
  | 'getAll'
  | 'update'
  | 'delete'
  | 'getAvailability'
  | 'setAvailability'
  | 'startOutboundCall'
  | 'dialNumber';

export type NumberOperation = 'get' | 'getAll' | 'update' | 'getMessages' | 'getMusic';

export type ContactOperation = 'create' | 'get' | 'getAll' | 'update' | 'delete' | 'search';

export type TeamOperation =
  | 'create'
  | 'get'
  | 'getAll'
  | 'update'
  | 'delete'
  | 'addUser'
  | 'removeUser';

export type TagOperation = 'create' | 'get' | 'getAll' | 'update' | 'delete';

export type WebhookOperation = 'create' | 'get' | 'getAll' | 'update' | 'delete';

export type MessageOperation = 'send' | 'get' | 'getAll';

export type CompanyOperation = 'get';

export type IntegrationOperation = 'getAll' | 'link' | 'unlink';

export interface AircallCall {
  id: number;
  direct_link: string;
  direction: 'inbound' | 'outbound';
  status: string;
  missed_call_reason?: string;
  started_at: number;
  answered_at?: number;
  ended_at?: number;
  duration: number;
  voicemail?: string;
  recording?: string;
  asset?: string;
  raw_digits: string;
  user?: AircallUser;
  contact?: AircallContact;
  number?: AircallNumber;
  archived: boolean;
  assigned_to?: AircallUser;
  transferred_from?: AircallUser;
  transferred_to?: AircallUser;
  cost?: string;
  tags: AircallTag[];
  comments: AircallComment[];
}

export interface AircallUser {
  id: number;
  direct_link: string;
  name: string;
  email: string;
  available: boolean;
  availability_status: 'available' | 'custom' | 'do_not_disturb';
  created_at: string;
  time_zone: string;
  language: string;
  substatus?: string;
  numbers?: AircallNumber[];
  wrap_up_time?: number;
}

export interface AircallNumber {
  id: number;
  direct_link: string;
  name: string;
  digits: string;
  country: string;
  time_zone: string;
  open: boolean;
  availability_status: string;
  is_ivr: boolean;
  live_recording_activated: boolean;
  messages: {
    welcome?: string;
    waiting?: string;
    ivr?: string;
    voicemail?: string;
    closed?: string;
    callback_later?: string;
    unanswered_call?: string;
    after_hours?: string;
    ringing_tone?: string;
  };
  users?: AircallUser[];
}

export interface AircallContact {
  id: number;
  direct_link: string;
  first_name: string;
  last_name: string;
  company_name: string;
  information: string;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
  phone_numbers: AircallPhoneNumber[];
  emails: AircallEmail[];
}

export interface AircallPhoneNumber {
  id: number;
  label: string;
  value: string;
}

export interface AircallEmail {
  id: number;
  label: string;
  value: string;
}

export interface AircallTeam {
  id: number;
  direct_link: string;
  name: string;
  created_at: string;
  users: AircallUser[];
}

export interface AircallTag {
  id: number;
  direct_link: string;
  name: string;
  color: string;
  description?: string;
}

export interface AircallComment {
  id: number;
  content: string;
  posted_at: string;
  posted_by: AircallUser;
}

export interface AircallWebhook {
  id: number;
  direct_link: string;
  url: string;
  active: boolean;
  created_at: string;
  events: string[];
  custom_headers?: Record<string, string>;
  token?: string;
}

export interface AircallMessage {
  id: number;
  direct_link: string;
  direction: 'inbound' | 'outbound';
  content: string;
  created_at: string;
  status: string;
  number: AircallNumber;
  contact?: AircallContact;
  raw_digits: string;
}

export interface AircallCompany {
  name: string;
  users_count: number;
  numbers_count: number;
  default_country: string;
  webhook_url?: string;
}

export interface AircallIntegration {
  id: number;
  name: string;
  logo_url: string;
  company_id: number;
  active: boolean;
  external_id?: string;
}

export interface AircallPaginationMeta {
  count: number;
  total: number;
  current_page: number;
  per_page: number;
  next_page_link: string | null;
  previous_page_link: string | null;
}

export interface AircallApiResponse<T> {
  meta?: AircallPaginationMeta;
  [key: string]: T[] | AircallPaginationMeta | T | undefined;
}

export interface WebhookEvent {
  event: string;
  resource: string;
  data: Record<string, unknown>;
  timestamp: number;
  token?: string;
}

export const AIRCALL_WEBHOOK_EVENTS = [
  'call.created',
  'call.ringing_on_agent',
  'call.agent_declined',
  'call.answered',
  'call.transferred',
  'call.unsuccessful_transfer',
  'call.ended',
  'call.voicemail_left',
  'call.assigned',
  'call.archived',
  'call.tagged',
  'call.untagged',
  'call.commented',
  'contact.created',
  'contact.updated',
  'contact.deleted',
  'user.created',
  'user.opened',
  'user.closed',
  'user.deleted',
  'user.connected',
  'user.disconnected',
  'number.created',
  'number.opened',
  'number.closed',
  'number.deleted',
  'message.created',
] as const;

export type AircallWebhookEvent = (typeof AIRCALL_WEBHOOK_EVENTS)[number];
