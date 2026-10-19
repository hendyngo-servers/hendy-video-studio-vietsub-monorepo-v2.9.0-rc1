import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const downloadTokens = sqliteTable('download_tokens', {
  id: text('id').primaryKey(),
  token: text('token').notNull().unique(),
  fileKey: text('file_key').notNull(),
  isUsed: integer('is_used').default(0).notNull(),
  expiresAt: integer('expires_at').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const downloadLogs = sqliteTable('download_logs', {
  id: text('id').primaryKey(),
  tokenId: text('token_id').notNull(),
  ipAddress: text('ip_address').notNull(),
  createdAt: integer('created_at').notNull(),
});
