import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default('seller'), // 'admin' or 'seller'
  companyId: uuid("company_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table for white-label branding
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  logoUrl: varchar("logo_url"),
  primaryColor: varchar("primary_color").default('#10b981'),
  secondaryColor: varchar("secondary_color").default('#f59e0b'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  companyId: uuid("company_id").notNull(),
  prizeEmoji: varchar("prize_emoji").default('🏆'),
  prizeImageUrl: varchar("prize_image_url"),
  prizeDescription: text("prize_description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Campaign participants (many-to-many between users and campaigns)
export const campaignParticipants = pgTable("campaign_participants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id").notNull(),
  userId: varchar("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Sales table
export const sales = pgTable("sales", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid("campaign_id").notNull(),
  sellerId: varchar("seller_id").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  customerName: varchar("customer_name"),
  productDescription: text("product_description"),
  notes: text("notes"),
  saleDate: timestamp("sale_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").notNull(), // user who entered the sale
});

// Invitations table
export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  companyId: uuid("company_id").notNull(),
  role: varchar("role").notNull().default('seller'),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  sales: many(sales),
  campaignParticipants: many(campaignParticipants),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  campaigns: many(campaigns),
  invitations: many(invitations),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  company: one(companies, {
    fields: [campaigns.companyId],
    references: [companies.id],
  }),
  participants: many(campaignParticipants),
  sales: many(sales),
}));

export const campaignParticipantsRelations = relations(campaignParticipants, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignParticipants.campaignId],
    references: [campaigns.id],
  }),
  user: one(users, {
    fields: [campaignParticipants.userId],
    references: [users.id],
  }),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [sales.campaignId],
    references: [campaigns.id],
  }),
  seller: one(users, {
    fields: [sales.sellerId],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [sales.createdBy],
    references: [users.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  company: one(companies, {
    fields: [invitations.companyId],
    references: [companies.id],
  }),
  createdBy: one(users, {
    fields: [invitations.createdBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertInvitationSchema = createInsertSchema(invitations).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignParticipantSchema = createInsertSchema(campaignParticipants).omit({
  id: true,
  joinedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type CampaignParticipant = typeof campaignParticipants.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type InsertCampaignParticipant = z.infer<typeof insertCampaignParticipantSchema>;
