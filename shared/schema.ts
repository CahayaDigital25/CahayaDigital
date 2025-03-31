import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User role enum
export const roleEnum = pgEnum("role", [
  "admin",
  "moderator",
  "editor"
]);

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  role: text("role").notNull().default("editor"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
  isActive: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// News category enum
export const categoryEnum = pgEnum("category", [
  "politik",
  "ekonomi",
  "teknologi",
  "olahraga",
  "hiburan",
  "pendidikan",
  "kesehatan",
  "gaya_hidup",
  "otomotif",
  "properti",
]);

// News articles schema
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  category: categoryEnum("category").notNull(),
  imageUrl: text("image_url").notNull(),
  author: text("author").notNull(),
  authorImage: text("author_image"),
  isFeatured: boolean("is_featured").default(false),
  isBreaking: boolean("is_breaking").default(false),
  isEditorsPick: boolean("is_editors_pick").default(false),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  views: integer("views").default(0),
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  views: true,
  publishedAt: true,
});

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

// Site settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").default("CahayaDigital25"),
  logoText: text("logo_text").default("CD"),
  primaryColor: text("primary_color").default("#e53e3e"),
  secondaryColor: text("secondary_color").default("#333333"),
  accentColor: text("accent_color").default("#f6ad55"),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

// Subscribers schema
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});

export const insertSubscriberSchema = createInsertSchema(subscribers).pick({
  email: true,
});

export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;
