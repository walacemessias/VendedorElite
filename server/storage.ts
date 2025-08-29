import {
  users,
  companies,
  campaigns,
  sales,
  campaignParticipants,
  invitations,
  type User,
  type UpsertUser,
  type Company,
  type Campaign,
  type Sale,
  type CampaignParticipant,
  type Invitation,
  type InsertCompany,
  type InsertCampaign,
  type InsertSale,
  type InsertCampaignParticipant,
  type InsertInvitation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Company operations
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company>;
  
  // Campaign operations
  getCampaign(id: string): Promise<Campaign | undefined>;
  getCampaignsByCompany(companyId: string): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, campaign: Partial<InsertCampaign>): Promise<Campaign>;
  
  // Sales operations
  createSale(sale: InsertSale): Promise<Sale>;
  getSalesByCampaign(campaignId: string): Promise<Sale[]>;
  deleteSale(id: string): Promise<void>;
  
  // Campaign participants
  addCampaignParticipant(participant: InsertCampaignParticipant): Promise<CampaignParticipant>;
  getCampaignParticipants(campaignId: string): Promise<User[]>;
  getUserCampaigns(userId: string): Promise<Campaign[]>;
  
  // Invitations
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  getInvitationByToken(token: string): Promise<Invitation | undefined>;
  markInvitationUsed(id: string): Promise<void>;
  
  // Leaderboard
  getCampaignLeaderboard(campaignId: string): Promise<{
    userId: string;
    user: User;
    totalSales: number;
    salesCount: number;
  }[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [created] = await db.insert(companies).values(company).returning();
    return created;
  }

  async updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company> {
    const [updated] = await db
      .update(companies)
      .set({ ...company, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return updated;
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async getCampaignsByCompany(companyId: string): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.companyId, companyId))
      .orderBy(desc(campaigns.createdAt));
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [created] = await db.insert(campaigns).values(campaign).returning();
    return created;
  }

  async updateCampaign(id: string, campaign: Partial<InsertCampaign>): Promise<Campaign> {
    const [updated] = await db
      .update(campaigns)
      .set({ ...campaign, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return updated;
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const [created] = await db.insert(sales).values(sale).returning();
    return created;
  }

  async getSalesByCampaign(campaignId: string): Promise<Sale[]> {
    return await db
      .select()
      .from(sales)
      .where(eq(sales.campaignId, campaignId))
      .orderBy(desc(sales.saleDate));
  }

  async deleteSale(id: string): Promise<void> {
    await db.delete(sales).where(eq(sales.id, id));
  }

  async addCampaignParticipant(participant: InsertCampaignParticipant): Promise<CampaignParticipant> {
    const [created] = await db.insert(campaignParticipants).values(participant).returning();
    return created;
  }

  async getCampaignParticipants(campaignId: string): Promise<User[]> {
    const participants = await db
      .select({
        user: users,
      })
      .from(campaignParticipants)
      .innerJoin(users, eq(campaignParticipants.userId, users.id))
      .where(eq(campaignParticipants.campaignId, campaignId));
    
    return participants.map(p => p.user);
  }

  async getUserCampaigns(userId: string): Promise<Campaign[]> {
    const userCampaigns = await db
      .select({
        campaign: campaigns,
      })
      .from(campaignParticipants)
      .innerJoin(campaigns, eq(campaignParticipants.campaignId, campaigns.id))
      .where(eq(campaignParticipants.userId, userId));
    
    return userCampaigns.map(c => c.campaign);
  }

  async createInvitation(invitation: InsertInvitation): Promise<Invitation> {
    const [created] = await db.insert(invitations).values(invitation).returning();
    return created;
  }

  async getInvitationByToken(token: string): Promise<Invitation | undefined> {
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.token, token));
    return invitation;
  }

  async markInvitationUsed(id: string): Promise<void> {
    await db
      .update(invitations)
      .set({ usedAt: new Date() })
      .where(eq(invitations.id, id));
  }

  async getCampaignLeaderboard(campaignId: string): Promise<{
    userId: string;
    user: User;
    totalSales: number;
    salesCount: number;
  }[]> {
    const leaderboard = await db
      .select({
        userId: sales.sellerId,
        user: users,
        totalSales: sql<number>`sum(${sales.amount})::numeric`.as('total_sales'),
        salesCount: sql<number>`count(${sales.id})::int`.as('sales_count'),
      })
      .from(sales)
      .innerJoin(users, eq(sales.sellerId, users.id))
      .where(eq(sales.campaignId, campaignId))
      .groupBy(sales.sellerId, users.id)
      .orderBy(desc(sql`sum(${sales.amount})`));

    return leaderboard.map(row => ({
      userId: row.userId,
      user: row.user,
      totalSales: Number(row.totalSales),
      salesCount: row.salesCount,
    }));
  }
}

export const storage = new DatabaseStorage();
