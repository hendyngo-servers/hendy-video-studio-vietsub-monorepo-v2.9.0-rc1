import { pgTable, uuid, varchar, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const softwareApps = pgTable('software_apps', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const appVersions = pgTable('app_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  appId: uuid('app_id').references(() => softwareApps.id).notNull(),
  versionNumber: varchar('version_number', { length: 50 }).notNull(),
  fileKey: varchar('file_key', { length: 512 }).notNull(),
  fileSize: integer('file_size').notNull(),
  sha256Hash: varchar('sha256_hash', { length: 64 }).notNull(),
  isClean: boolean('is_clean').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
