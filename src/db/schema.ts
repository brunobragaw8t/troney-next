import "dotenv/config";
import {
  date,
  decimal,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const activationTokens = pgTable("activation_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  value: varchar("value", { length: 32 }).notNull().unique(),
  resentAt: timestamp("resent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`NULL`),
});

export const buckets = pgTable("buckets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull().default("0"),
  balance: decimal("balance", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`NULL`),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 7 }).notNull().default("#3b82f6"),
  icon: varchar("icon", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`NULL`),
});

export const earnings = pgTable("earnings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  walletId: uuid("wallet_id").references(() => wallets.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  source: varchar("source", { length: 255 }).notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`NULL`),
});

export const earningAllocations = pgTable("earning_allocations", {
  id: uuid("id").primaryKey().defaultRandom(),
  earningId: uuid("earning_id")
    .notNull()
    .references(() => earnings.id, { onDelete: "cascade" }),
  bucketId: uuid("bucket_id").references(() => buckets.id, {
    onDelete: "cascade",
  }),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  bucketPercentage: decimal("bucket_percentage", {
    precision: 10,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`NULL`),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  walletId: uuid("wallet_id").references(() => wallets.id, {
    onDelete: "set null",
  }),
  bucketId: uuid("bucket_id").references(() => buckets.id, {
    onDelete: "cascade",
  }),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  source: varchar("source", { length: 255 }).notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`NULL`),
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, { fields: [expenses.userId], references: [users.id] }),
  wallet: one(wallets, {
    fields: [expenses.walletId],
    references: [wallets.id],
  }),
  bucket: one(buckets, {
    fields: [expenses.bucketId],
    references: [buckets.id],
  }),
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  activationToken: one(activationTokens, {
    fields: [users.id],
    references: [activationTokens.userId],
  }),
  wallets: many(wallets),
  buckets: many(buckets),
  categories: many(categories),
  earnings: many(earnings),
}));

export const activationTokensRelations = relations(
  activationTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [activationTokens.userId],
      references: [users.id],
    }),
  }),
);

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  earnings: many(earnings),
}));

export const bucketsRelations = relations(buckets, ({ one }) => ({
  user: one(users, {
    fields: [buckets.userId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
}));

export const earningsRelations = relations(earnings, ({ one }) => ({
  user: one(users, {
    fields: [earnings.userId],
    references: [users.id],
  }),
  wallet: one(wallets, {
    fields: [earnings.walletId],
    references: [wallets.id],
  }),
}));

export const earningAllocationsRelations = relations(
  earningAllocations,
  ({ one }) => ({
    earning: one(earnings, {
      fields: [earningAllocations.earningId],
      references: [earnings.id],
    }),
    bucket: one(buckets, {
      fields: [earningAllocations.bucketId],
      references: [buckets.id],
    }),
  }),
);
