import { sql } from "drizzle-orm";
import { bigint, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { randomUUID } from "node:crypto";

export const users = mysqlTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 256 }),
  email: varchar("email", { length: 256 }).notNull().unique(),
  password: varchar("password", { length: 256 }),
  activatedAt: timestamp("activated_at").default(sql`NULL`),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

export const activationTokens = mysqlTable("activation_tokens", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  userId: bigint("user_id", { mode: "number" })
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  value: varchar("value", { length: 36 }).$defaultFn(randomUUID),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
