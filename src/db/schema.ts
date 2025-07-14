import "dotenv/config";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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

export const usersRelations = relations(users, ({ one }) => ({
  activationToken: one(activationTokens, {
    fields: [users.id],
    references: [activationTokens.userId],
  }),
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
