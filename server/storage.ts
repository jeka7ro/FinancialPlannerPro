import {
  users,
  companies,
  locations,
  providers,
  cabinets,
  gameMixes,
  slots,
  invoices,
  rentAgreements,
  legalDocuments,
  onjnReports,
  activityLogs,
  type User,
  type InsertUser,
  type Company,
  type InsertCompany,
  type Location,
  type InsertLocation,
  type Provider,
  type InsertProvider,
  type Cabinet,
  type InsertCabinet,
  type GameMix,
  type InsertGameMix,
  type Slot,
  type InsertSlot,
  type Invoice,
  type InsertInvoice,
  type RentAgreement,
  type InsertRentAgreement,
  type LegalDocument,
  type InsertLegalDocument,
  type OnjnReport,
  type InsertOnjnReport,
  type ActivityLog,
  type InsertActivityLog,
  type Attachment,
  type InsertAttachment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, count } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getUsers(page?: number, limit?: number, search?: string): Promise<{ users: User[]; total: number }>;

  // Company operations
  getCompany(id: number): Promise<Company | undefined>;
  getCompanies(page?: number, limit?: number, search?: string): Promise<{ companies: Company[]; total: number }>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company>;
  deleteCompany(id: number): Promise<void>;

  // Location operations
  getLocation(id: number): Promise<Location | undefined>;
  getLocations(page?: number, limit?: number, search?: string): Promise<{ locations: Location[]; total: number }>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location>;
  deleteLocation(id: number): Promise<void>;

  // Provider operations
  getProvider(id: number): Promise<Provider | undefined>;
  getProviders(page?: number, limit?: number, search?: string): Promise<{ providers: Provider[]; total: number }>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  updateProvider(id: number, provider: Partial<InsertProvider>): Promise<Provider>;
  deleteProvider(id: number): Promise<void>;

  // Cabinet operations
  getCabinet(id: number): Promise<Cabinet | undefined>;
  getCabinets(page?: number, limit?: number, search?: string): Promise<{ cabinets: Cabinet[]; total: number }>;
  createCabinet(cabinet: InsertCabinet): Promise<Cabinet>;
  updateCabinet(id: number, cabinet: Partial<InsertCabinet>): Promise<Cabinet>;
  deleteCabinet(id: number): Promise<void>;

  // Game Mix operations
  getGameMix(id: number): Promise<GameMix | undefined>;
  getGameMixes(page?: number, limit?: number, search?: string): Promise<{ gameMixes: GameMix[]; total: number }>;
  createGameMix(gameMix: InsertGameMix): Promise<GameMix>;
  updateGameMix(id: number, gameMix: Partial<InsertGameMix>): Promise<GameMix>;
  deleteGameMix(id: number): Promise<void>;

  // Slot operations
  getSlot(id: number): Promise<Slot | undefined>;
  getSlots(page?: number, limit?: number, search?: string): Promise<{ slots: Slot[]; total: number }>;
  createSlot(slot: InsertSlot): Promise<Slot>;
  updateSlot(id: number, slot: Partial<InsertSlot>): Promise<Slot>;
  deleteSlot(id: number): Promise<void>;

  // Invoice operations
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoices(page?: number, limit?: number, search?: string): Promise<{ invoices: Invoice[]; total: number }>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  deleteInvoice(id: number): Promise<void>;

  // Rent Agreement operations
  getRentAgreement(id: number): Promise<RentAgreement | undefined>;
  getRentAgreements(page?: number, limit?: number, search?: string): Promise<{ rentAgreements: RentAgreement[]; total: number }>;
  createRentAgreement(rentAgreement: InsertRentAgreement): Promise<RentAgreement>;
  updateRentAgreement(id: number, rentAgreement: Partial<InsertRentAgreement>): Promise<RentAgreement>;
  deleteRentAgreement(id: number): Promise<void>;

  // Legal Document operations
  getLegalDocument(id: number): Promise<LegalDocument | undefined>;
  getLegalDocuments(page?: number, limit?: number, search?: string): Promise<{ legalDocuments: LegalDocument[]; total: number }>;
  createLegalDocument(legalDocument: InsertLegalDocument): Promise<LegalDocument>;
  updateLegalDocument(id: number, legalDocument: Partial<InsertLegalDocument>): Promise<LegalDocument>;
  deleteLegalDocument(id: number): Promise<void>;

  // ONJN Report operations
  getOnjnReport(id: number): Promise<OnjnReport | undefined>;
  getOnjnReports(page?: number, limit?: number, search?: string): Promise<{ onjnReports: OnjnReport[]; total: number }>;
  createOnjnReport(onjnReport: InsertOnjnReport): Promise<OnjnReport>;
  updateOnjnReport(id: number, onjnReport: Partial<InsertOnjnReport>): Promise<OnjnReport>;
  deleteOnjnReport(id: number): Promise<void>;

  // Activity Log operations
  getActivityLogs(page?: number, limit?: number): Promise<{ activityLogs: ActivityLog[]; total: number }>;
  createActivityLog(activityLog: InsertActivityLog): Promise<ActivityLog>;

  // Dashboard operations
  getDashboardStats(): Promise<any>;
  authenticateUser(username: string, password: string): Promise<User | null>;

  // Attachment operations
  getAttachment(id: number): Promise<Attachment | undefined>;
  getAttachments(entityType: string, entityId: number): Promise<Attachment[]>;
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  deleteAttachment(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User> {
    const updateData: any = { ...updateUser };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    updateData.updatedAt = new Date();

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getUsers(page = 1, limit = 10, search = ""): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;
    const whereClause = search 
      ? like(users.username, `%${search}%`)
      : undefined;

    const [usersResult, [{ total }]] = await Promise.all([
      db.select().from(users)
        .where(whereClause)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(users).where(whereClause)
    ]);

    return { users: usersResult, total: total || 0 };
  }

  // Company operations
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompanies(page = 1, limit = 10, search = ""): Promise<{ companies: Company[]; total: number }> {
    const offset = (page - 1) * limit;
    const whereClause = search 
      ? like(companies.name, `%${search}%`)
      : undefined;

    const [companiesResult, [{ total }]] = await Promise.all([
      db.select().from(companies)
        .where(whereClause)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(companies).where(whereClause)
    ]);

    return { companies: companiesResult, total: total || 0 };
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(insertCompany)
      .returning();
    return company;
  }

  async updateCompany(id: number, updateCompany: Partial<InsertCompany>): Promise<Company> {
    const [company] = await db
      .update(companies)
      .set({ ...updateCompany, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  async deleteCompany(id: number): Promise<void> {
    await db.delete(companies).where(eq(companies.id, id));
  }

  // Location operations
  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location || undefined;
  }

  async getLocations(page = 1, limit = 10, search = ""): Promise<{ locations: Location[]; total: number }> {
    const offset = (page - 1) * limit;
    const whereClause = search 
      ? like(locations.name, `%${search}%`)
      : undefined;

    const [locationsResult, [{ total }]] = await Promise.all([
      db.select().from(locations)
        .where(whereClause)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(locations).where(whereClause)
    ]);

    return { locations: locationsResult, total: total || 0 };
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db
      .insert(locations)
      .values(insertLocation)
      .returning();
    return location;
  }

  async updateLocation(id: number, updateLocation: Partial<InsertLocation>): Promise<Location> {
    const [location] = await db
      .update(locations)
      .set({ ...updateLocation, updatedAt: new Date() })
      .where(eq(locations.id, id))
      .returning();
    return location;
  }

  async deleteLocation(id: number): Promise<void> {
    await db.delete(locations).where(eq(locations.id, id));
  }

  // Provider operations
  async getProvider(id: number): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.id, id));
    return provider || undefined;
  }

  async getProviders(page = 1, limit = 10, search = ""): Promise<{ providers: Provider[]; total: number }> {
    const offset = (page - 1) * limit;
    const whereClause = search 
      ? like(providers.name, `%${search}%`)
      : undefined;

    const [providersResult, [{ total }]] = await Promise.all([
      db.select().from(providers)
        .where(whereClause)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(providers).where(whereClause)
    ]);

    return { providers: providersResult, total: total || 0 };
  }

  async createProvider(insertProvider: InsertProvider): Promise<Provider> {
    const [provider] = await db
      .insert(providers)
      .values(insertProvider)
      .returning();
    return provider;
  }

  async updateProvider(id: number, updateProvider: Partial<InsertProvider>): Promise<Provider> {
    const [provider] = await db
      .update(providers)
      .set({ ...updateProvider, updatedAt: new Date() })
      .where(eq(providers.id, id))
      .returning();
    return provider;
  }

  async deleteProvider(id: number): Promise<void> {
    await db.delete(providers).where(eq(providers.id, id));
  }

  // Cabinet operations
  async getCabinet(id: number): Promise<Cabinet | undefined> {
    const [cabinet] = await db.select().from(cabinets).where(eq(cabinets.id, id));
    return cabinet || undefined;
  }

  async getCabinets(page = 1, limit = 10, search = ""): Promise<{ cabinets: Cabinet[]; total: number }> {
    const offset = (page - 1) * limit;
    const whereClause = search 
      ? like(cabinets.serialNumber, `%${search}%`)
      : undefined;

    const [cabinetsResult, [{ total }]] = await Promise.all([
      db.select().from(cabinets)
        .where(whereClause)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(cabinets).where(whereClause)
    ]);

    return { cabinets: cabinetsResult, total: total || 0 };
  }

  async createCabinet(insertCabinet: InsertCabinet): Promise<Cabinet> {
    const [cabinet] = await db
      .insert(cabinets)
      .values(insertCabinet)
      .returning();
    return cabinet;
  }

  async updateCabinet(id: number, updateCabinet: Partial<InsertCabinet>): Promise<Cabinet> {
    const [cabinet] = await db
      .update(cabinets)
      .set({ ...updateCabinet, updatedAt: new Date() })
      .where(eq(cabinets.id, id))
      .returning();
    return cabinet;
  }

  async deleteCabinet(id: number): Promise<void> {
    await db.delete(cabinets).where(eq(cabinets.id, id));
  }

  // Game Mix operations
  async getGameMix(id: number): Promise<GameMix | undefined> {
    const [gameMix] = await db.select().from(gameMixes).where(eq(gameMixes.id, id));
    return gameMix || undefined;
  }

  async getGameMixes(page = 1, limit = 10, search = ""): Promise<{ gameMixes: GameMix[]; total: number }> {
    const offset = (page - 1) * limit;
    const whereClause = search 
      ? like(gameMixes.name, `%${search}%`)
      : undefined;

    const [gameMixesResult, [{ total }]] = await Promise.all([
      db.select().from(gameMixes)
        .where(whereClause)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(gameMixes).where(whereClause)
    ]);

    return { gameMixes: gameMixesResult, total: total || 0 };
  }

  async createGameMix(insertGameMix: InsertGameMix): Promise<GameMix> {
    const [gameMix] = await db
      .insert(gameMixes)
      .values(insertGameMix)
      .returning();
    return gameMix;
  }

  async updateGameMix(id: number, updateGameMix: Partial<InsertGameMix>): Promise<GameMix> {
    const [gameMix] = await db
      .update(gameMixes)
      .set({ ...updateGameMix, updatedAt: new Date() })
      .where(eq(gameMixes.id, id))
      .returning();
    return gameMix;
  }

  async deleteGameMix(id: number): Promise<void> {
    await db.delete(gameMixes).where(eq(gameMixes.id, id));
  }

  // Slot operations
  async getSlot(id: number): Promise<Slot | undefined> {
    const [slot] = await db.select().from(slots).where(eq(slots.id, id));
    return slot || undefined;
  }

  async getSlots(page = 1, limit = 10, search = ""): Promise<{ slots: Slot[]; total: number }> {
    const offset = (page - 1) * limit;
    const whereClause = search 
      ? like(slots.gameName, `%${search}%`)
      : undefined;

    const [slotsResult, [{ total }]] = await Promise.all([
      db.select().from(slots)
        .where(whereClause)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(slots).where(whereClause)
    ]);

    return { slots: slotsResult, total: total || 0 };
  }

  async createSlot(insertSlot: InsertSlot): Promise<Slot> {
    const [slot] = await db
      .insert(slots)
      .values(insertSlot)
      .returning();
    return slot;
  }

  async updateSlot(id: number, updateSlot: Partial<InsertSlot>): Promise<Slot> {
    const [slot] = await db
      .update(slots)
      .set({ ...updateSlot, updatedAt: new Date() })
      .where(eq(slots.id, id))
      .returning();
    return slot;
  }

  async deleteSlot(id: number): Promise<void> {
    await db.delete(slots).where(eq(slots.id, id));
  }

  // Invoice operations
  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async getInvoices(page = 1, limit = 10, search = ""): Promise<{ invoices: Invoice[]; total: number }> {
    const offset = (page - 1) * limit;
    const whereClause = search 
      ? like(invoices.invoiceNumber, `%${search}%`)
      : undefined;

    const [invoicesResult, [{ total }]] = await Promise.all([
      db.select().from(invoices)
        .where(whereClause)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(invoices).where(whereClause)
    ]);

    return { invoices: invoicesResult, total: total || 0 };
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db
      .insert(invoices)
      .values(insertInvoice)
      .returning();
    return invoice;
  }

  async updateInvoice(id: number, updateInvoice: Partial<InsertInvoice>): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set({ ...updateInvoice, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async deleteInvoice(id: number): Promise<void> {
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  // Rent Agreement operations
  async getRentAgreement(id: number): Promise<RentAgreement | undefined> {
    const [rentAgreement] = await db.select().from(rentAgreements).where(eq(rentAgreements.id, id));
    return rentAgreement || undefined;
  }

  async getRentAgreements(page = 1, limit = 10, search = ""): Promise<{ rentAgreements: RentAgreement[]; total: number }> {
    const offset = (page - 1) * limit;
    const whereClause = search 
      ? like(rentAgreements.agreementNumber, `%${search}%`)
      : undefined;

    const [rentAgreementsResult, [{ total }]] = await Promise.all([
      db.select().from(rentAgreements)
        .where(whereClause)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(rentAgreements).where(whereClause)
    ]);

    return { rentAgreements: rentAgreementsResult, total: total || 0 };
  }

  async createRentAgreement(insertRentAgreement: InsertRentAgreement): Promise<RentAgreement> {
    const [rentAgreement] = await db
      .insert(rentAgreements)
      .values(insertRentAgreement)
      .returning();
    return rentAgreement;
  }

  async updateRentAgreement(id: number, updateRentAgreement: Partial<InsertRentAgreement>): Promise<RentAgreement> {
    const [rentAgreement] = await db
      .update(rentAgreements)
      .set({ ...updateRentAgreement, updatedAt: new Date() })
      .where(eq(rentAgreements.id, id))
      .returning();
    return rentAgreement;
  }

  async deleteRentAgreement(id: number): Promise<void> {
    await db.delete(rentAgreements).where(eq(rentAgreements.id, id));
  }

  // Legal Document operations
  async getLegalDocument(id: number): Promise<LegalDocument | undefined> {
    const [legalDocument] = await db.select().from(legalDocuments).where(eq(legalDocuments.id, id));
    return legalDocument || undefined;
  }

  async getLegalDocuments(page = 1, limit = 10, search = ""): Promise<{ legalDocuments: LegalDocument[]; total: number }> {
    const offset = (page - 1) * limit;
    const whereClause = search 
      ? like(legalDocuments.title, `%${search}%`)
      : undefined;

    const [legalDocumentsResult, [{ total }]] = await Promise.all([
      db.select().from(legalDocuments)
        .where(whereClause)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(legalDocuments).where(whereClause)
    ]);

    return { legalDocuments: legalDocumentsResult, total: total || 0 };
  }

  async createLegalDocument(insertLegalDocument: InsertLegalDocument): Promise<LegalDocument> {
    const [legalDocument] = await db
      .insert(legalDocuments)
      .values(insertLegalDocument)
      .returning();
    return legalDocument;
  }

  async updateLegalDocument(id: number, updateLegalDocument: Partial<InsertLegalDocument>): Promise<LegalDocument> {
    const [legalDocument] = await db
      .update(legalDocuments)
      .set({ ...updateLegalDocument, updatedAt: new Date() })
      .where(eq(legalDocuments.id, id))
      .returning();
    return legalDocument;
  }

  async deleteLegalDocument(id: number): Promise<void> {
    await db.delete(legalDocuments).where(eq(legalDocuments.id, id));
  }

  // ONJN Report operations
  async getOnjnReport(id: number): Promise<OnjnReport | undefined> {
    const [onjnReport] = await db.select().from(onjnReports).where(eq(onjnReports.id, id));
    return onjnReport || undefined;
  }

  async getOnjnReports(page = 1, limit = 10, search = ""): Promise<{ onjnReports: OnjnReport[]; total: number }> {
    const offset = (page - 1) * limit;
    const whereClause = search 
      ? like(onjnReports.reportType, `%${search}%`)
      : undefined;

    const [onjnReportsResult, [{ total }]] = await Promise.all([
      db.select().from(onjnReports)
        .where(whereClause)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(onjnReports).where(whereClause)
    ]);

    return { onjnReports: onjnReportsResult, total: total || 0 };
  }

  async createOnjnReport(insertOnjnReport: InsertOnjnReport): Promise<OnjnReport> {
    const [onjnReport] = await db
      .insert(onjnReports)
      .values(insertOnjnReport)
      .returning();
    return onjnReport;
  }

  async updateOnjnReport(id: number, updateOnjnReport: Partial<InsertOnjnReport>): Promise<OnjnReport> {
    const [onjnReport] = await db
      .update(onjnReports)
      .set({ ...updateOnjnReport, updatedAt: new Date() })
      .where(eq(onjnReports.id, id))
      .returning();
    return onjnReport;
  }

  async deleteOnjnReport(id: number): Promise<void> {
    await db.delete(onjnReports).where(eq(onjnReports.id, id));
  }

  // Activity Log operations
  async getActivityLogs(page = 1, limit = 10): Promise<{ activityLogs: ActivityLog[]; total: number }> {
    const offset = (page - 1) * limit;

    const [activityLogsResult, [{ total }]] = await Promise.all([
      db.select().from(activityLogs)
        .orderBy(desc(activityLogs.timestamp))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(activityLogs)
    ]);

    return { activityLogs: activityLogsResult, total: total || 0 };
  }

  async createActivityLog(insertActivityLog: InsertActivityLog): Promise<ActivityLog> {
    const [activityLog] = await db
      .insert(activityLogs)
      .values(insertActivityLog)
      .returning();
    return activityLog;
  }

  // Dashboard operations
  async getDashboardStats(): Promise<any> {
    const [
      totalRevenue,
      activeCabinets,
      totalLocations,
      avgDailyPlay,
      recentActivity,
      topLocations
    ] = await Promise.all([
      db.select({ total: count() }).from(invoices),
      db.select({ total: count() }).from(cabinets).where(eq(cabinets.status, 'active')),
      db.select({ total: count() }).from(locations).where(eq(locations.isActive, true)),
      db.select({ total: count() }).from(slots).where(eq(slots.status, 'active')),
      db.select().from(activityLogs).orderBy(desc(activityLogs.timestamp)).limit(5),
      db.select().from(locations).where(eq(locations.isActive, true)).limit(3)
    ]);

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      activeCabinets: activeCabinets[0]?.total || 0,
      totalLocations: totalLocations[0]?.total || 0,
      avgDailyPlay: avgDailyPlay[0]?.total || 0,
      recentActivity,
      topLocations
    };
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  // Attachment operations
  async getAttachment(id: number): Promise<Attachment | undefined> {
    const [attachment] = await db.select().from(attachments).where(eq(attachments.id, id));
    return attachment || undefined;
  }

  async getAttachments(entityType: string, entityId: number): Promise<Attachment[]> {
    return await db.select().from(attachments)
      .where(and(eq(attachments.entityType, entityType), eq(attachments.entityId, entityId)))
      .orderBy(desc(attachments.createdAt));
  }

  async createAttachment(insertAttachment: InsertAttachment): Promise<Attachment> {
    const [attachment] = await db
      .insert(attachments)
      .values(insertAttachment)
      .returning();
    return attachment;
  }

  async deleteAttachment(id: number): Promise<void> {
    await db.delete(attachments).where(eq(attachments.id, id));
  }
}

export const storage = new DatabaseStorage();
