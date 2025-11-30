import { pgTable, uuid, varchar, text, timestamp, pgEnum, integer, date, json, boolean, time, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'station']);
export const stationStatusEnum = pgEnum('station_status', ['active', 'suspended']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'overdue']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('station'),
  stationId: uuid('station_id').references(() => radioStations.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
  stationIdx: index('users_station_idx').on(table.stationId),
}));

// Radio Stations table
export const radioStations = pgTable('radio_stations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  address: text('address'),
  description: text('description'),
  musicGenre: varchar('music_genre', { length: 255 }),

  // Contact information
  contactName: varchar('contact_name', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  contactEmail: varchar('contact_email', { length: 255 }),

  // Stream URLs
  streamUrlPrimary: varchar('stream_url_primary', { length: 500 }).notNull(),
  streamUrlBackup: varchar('stream_url_backup', { length: 500 }),

  // API authentication
  apiKey: varchar('api_key', { length: 255 }).notNull().unique(),

  // Station status
  status: stationStatusEnum('status').notNull().default('active'),

  // Subscription management
  subscriptionDueDate: date('subscription_due_date'),
  lastPaymentDate: date('last_payment_date'),

  // Branding (JSON object with logo_url, primary_color, secondary_color)
  branding: json('branding').$type<{
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  }>(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  apiKeyIdx: uniqueIndex('stations_api_key_idx').on(table.apiKey),
  slugIdx: uniqueIndex('stations_slug_idx').on(table.slug),
  statusIdx: index('stations_status_idx').on(table.status),
}));

// Programs table (radio show schedules)
export const programs = pgTable('programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  stationId: uuid('station_id').notNull().references(() => radioStations.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  hostName: varchar('host_name', { length: 255 }),
  description: text('description'),

  // Schedule information
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 6 = Saturday
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),

  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  stationIdx: index('programs_station_idx').on(table.stationId),
  dayIdx: index('programs_day_idx').on(table.dayOfWeek),
  activeIdx: index('programs_active_idx').on(table.isActive),
}));

// Payments table
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  stationId: uuid('station_id').notNull().references(() => radioStations.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // Amount in cents
  paymentDate: date('payment_date'),
  dueDate: date('due_date').notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  notes: text('notes'),
  recordedBy: uuid('recorded_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  stationIdx: index('payments_station_idx').on(table.stationId),
  statusIdx: index('payments_status_idx').on(table.status),
  dueDateIdx: index('payments_due_date_idx').on(table.dueDate),
}));

// Analytics Daily table
export const analyticsDaily = pgTable('analytics_daily', {
  id: uuid('id').primaryKey().defaultRandom(),
  stationId: uuid('station_id').notNull().references(() => radioStations.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  totalListeners: integer('total_listeners').notNull().default(0),
  peakListeners: integer('peak_listeners').notNull().default(0),
  peakTime: time('peak_time'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  stationDateIdx: uniqueIndex('analytics_daily_station_date_idx').on(table.stationId, table.date),
  dateIdx: index('analytics_daily_date_idx').on(table.date),
}));

// Analytics Geography table
export const analyticsGeography = pgTable('analytics_geography', {
  id: uuid('id').primaryKey().defaultRandom(),
  stationId: uuid('station_id').notNull().references(() => radioStations.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  city: varchar('city', { length: 255 }),
  listenerCount: integer('listener_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  stationDateIdx: index('analytics_geo_station_date_idx').on(table.stationId, table.date),
  countryIdx: index('analytics_geo_country_idx').on(table.country),
}));

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  station: one(radioStations, {
    fields: [users.stationId],
    references: [radioStations.id],
  }),
}));

export const radioStationsRelations = relations(radioStations, ({ many }) => ({
  users: many(users),
  programs: many(programs),
  payments: many(payments),
  analyticsDaily: many(analyticsDaily),
  analyticsGeography: many(analyticsGeography),
}));

export const programsRelations = relations(programs, ({ one }) => ({
  station: one(radioStations, {
    fields: [programs.stationId],
    references: [radioStations.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  station: one(radioStations, {
    fields: [payments.stationId],
    references: [radioStations.id],
  }),
  recordedByUser: one(users, {
    fields: [payments.recordedBy],
    references: [users.id],
  }),
}));

export const analyticsDailyRelations = relations(analyticsDaily, ({ one }) => ({
  station: one(radioStations, {
    fields: [analyticsDaily.stationId],
    references: [radioStations.id],
  }),
}));

export const analyticsGeographyRelations = relations(analyticsGeography, ({ one }) => ({
  station: one(radioStations, {
    fields: [analyticsGeography.stationId],
    references: [radioStations.id],
  }),
}));

// Type exports for use in the application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type RadioStation = typeof radioStations.$inferSelect;
export type NewRadioStation = typeof radioStations.$inferInsert;

export type Program = typeof programs.$inferSelect;
export type NewProgram = typeof programs.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type AnalyticsDaily = typeof analyticsDaily.$inferSelect;
export type NewAnalyticsDaily = typeof analyticsDaily.$inferInsert;

export type AnalyticsGeography = typeof analyticsGeography.$inferSelect;
export type NewAnalyticsGeography = typeof analyticsGeography.$inferInsert;
