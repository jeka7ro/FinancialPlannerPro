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
  attachments,
  billingPlans,
  locationBilling,
  revenueReports,
  automatedBills,
  billingSchedules,
  paymentHistory,
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
  type BillingPlan,
  type InsertBillingPlan,
  type LocationBilling,
  type InsertLocationBilling,
  type RevenueReport,
  type InsertRevenueReport,
  type AutomatedBill,
  type InsertAutomatedBill,
  type BillingSchedule,
  type InsertBillingSchedule,
  type PaymentHistory,
  type InsertPaymentHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, count, or } from "drizzle-orm";
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

  // Billing Plan operations
  getBillingPlan(id: number): Promise<BillingPlan | undefined>;
  getBillingPlans(page?: number, limit?: number, search?: string): Promise<{ billingPlans: BillingPlan[]; total: number }>;
  createBillingPlan(billingPlan: InsertBillingPlan): Promise<BillingPlan>;
  updateBillingPlan(id: number, billingPlan: Partial<InsertBillingPlan>): Promise<BillingPlan>;
  deleteBillingPlan(id: number): Promise<void>;

  // Location Billing operations
  getLocationBilling(id: number): Promise<LocationBilling | undefined>;
  getLocationBillings(page?: number, limit?: number, search?: string): Promise<{ locationBillings: LocationBilling[]; total: number }>;
  getLocationBillingByLocation(locationId: number): Promise<LocationBilling | undefined>;
  createLocationBilling(locationBilling: InsertLocationBilling): Promise<LocationBilling>;
  updateLocationBilling(id: number, locationBilling: Partial<InsertLocationBilling>): Promise<LocationBilling>;
  deleteLocationBilling(id: number): Promise<void>;

  // Revenue Report operations
  getRevenueReport(id: number): Promise<RevenueReport | undefined>;
  getRevenueReports(page?: number, limit?: number, search?: string): Promise<{ revenueReports: RevenueReport[]; total: number }>;
  getRevenueReportsByLocation(locationId: number, startDate?: Date, endDate?: Date): Promise<RevenueReport[]>;
  createRevenueReport(revenueReport: InsertRevenueReport): Promise<RevenueReport>;
  updateRevenueReport(id: number, revenueReport: Partial<InsertRevenueReport>): Promise<RevenueReport>;
  deleteRevenueReport(id: number): Promise<void>;

  // Automated Bill operations
  getAutomatedBill(id: number): Promise<AutomatedBill | undefined>;
  getAutomatedBills(page?: number, limit?: number, search?: string): Promise<{ automatedBills: AutomatedBill[]; total: number }>;
  getAutomatedBillsByLocation(locationId: number): Promise<AutomatedBill[]>;
  getPendingBills(): Promise<AutomatedBill[]>;
  getOverdueBills(): Promise<AutomatedBill[]>;
  createAutomatedBill(automatedBill: InsertAutomatedBill): Promise<AutomatedBill>;
  updateAutomatedBill(id: number, automatedBill: Partial<InsertAutomatedBill>): Promise<AutomatedBill>;
  deleteAutomatedBill(id: number): Promise<void>;
  markBillAsPaid(id: number, paymentData: { paidAmount: string; paidDate: Date; paymentMethod: string; paymentReference?: string }): Promise<AutomatedBill>;

  // Billing Schedule operations
  getBillingSchedule(id: number): Promise<BillingSchedule | undefined>;
  getBillingSchedules(page?: number, limit?: number): Promise<{ billingSchedules: BillingSchedule[]; total: number }>;
  getActiveSchedules(): Promise<BillingSchedule[]>;
  getDueSchedules(): Promise<BillingSchedule[]>;
  createBillingSchedule(billingSchedule: InsertBillingSchedule): Promise<BillingSchedule>;
  updateBillingSchedule(id: number, billingSchedule: Partial<InsertBillingSchedule>): Promise<BillingSchedule>;
  deleteBillingSchedule(id: number): Promise<void>;

  // Payment History operations
  getPaymentHistory(id: number): Promise<PaymentHistory | undefined>;
  getPaymentHistories(page?: number, limit?: number): Promise<{ paymentHistories: PaymentHistory[]; total: number }>;
  getPaymentHistoryByBill(automatedBillId: number): Promise<PaymentHistory[]>;
  createPaymentHistory(paymentHistory: InsertPaymentHistory): Promise<PaymentHistory>;
  deletePaymentHistory(id: number): Promise<void>;

  // Billing automation operations
  generateBillsForDueSchedules(): Promise<AutomatedBill[]>;
  calculateBillAmount(locationBillingId: number, startDate: Date, endDate: Date): Promise<{ baseRent: number; revenueShare: number; total: number }>;
  getBillingDashboardStats(): Promise<any>;
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
      ? or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`),
          like(users.role, `%${search}%`)
        )
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
      ? or(
          like(companies.name, `%${search}%`),
          like(companies.taxId, `%${search}%`),
          like(companies.address, `%${search}%`),
          like(companies.city, `%${search}%`),
          like(companies.country, `%${search}%`),
          like(companies.phone, `%${search}%`),
          like(companies.email, `%${search}%`),
          like(companies.website, `%${search}%`)
        )
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
      ? or(
          like(locations.name, `%${search}%`),
          like(locations.address, `%${search}%`),
          like(locations.city, `%${search}%`),
          like(locations.country, `%${search}%`),
          like(locations.phone, `%${search}%`),
          like(locations.email, `%${search}%`)
        )
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
      ? or(
          like(providers.name, `%${search}%`),
          like(providers.companyName, `%${search}%`),
          like(providers.contactPerson, `%${search}%`),
          like(providers.email, `%${search}%`),
          like(providers.phone, `%${search}%`),
          like(providers.address, `%${search}%`),
          like(providers.city, `%${search}%`),
          like(providers.country, `%${search}%`),
          like(providers.website, `%${search}%`)
        )
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
      ? or(
          like(cabinets.serialNumber, `%${search}%`),
          like(cabinets.model, `%${search}%`),
          like(cabinets.manufacturer, `%${search}%`),
          like(cabinets.status, `%${search}%`)
        )
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
      ? or(
          like(gameMixes.name, `%${search}%`),
          like(gameMixes.description, `%${search}%`)
        )
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
      ? or(
          like(slots.serialNr, `%${search}%`),
          like(slots.exciterType, `%${search}%`),
          like(slots.propertyType, `%${search}%`)
        )
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
      ? or(
          like(invoices.invoiceNumber, `%${search}%`),
          like(invoices.status, `%${search}%`),
          like(invoices.serialNumbers, `%${search}%`),
          like(invoices.propertyType, `%${search}%`),
          like(invoices.notes, `%${search}%`)
        )
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
      ? or(
          like(rentAgreements.agreementNumber, `%${search}%`),
          like(rentAgreements.status, `%${search}%`)
        )
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
      ? or(
          like(legalDocuments.title, `%${search}%`),
          like(legalDocuments.documentType, `%${search}%`),
          like(legalDocuments.status, `%${search}%`)
        )
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
      ? or(
          like(onjnReports.serialNumbers, `%${search}%`),
          like(onjnReports.notes, `%${search}%`)
        )
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
      db.select({ total: count() }).from(slots).where(eq(slots.isActive, true)),
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

  // Billing Plan operations
  async getBillingPlan(id: number): Promise<BillingPlan | undefined> {
    const [billingPlan] = await db.select().from(billingPlans).where(eq(billingPlans.id, id));
    return billingPlan || undefined;
  }

  async getBillingPlans(page = 1, limit = 10, search = ""): Promise<{ billingPlans: BillingPlan[]; total: number }> {
    const offset = (page - 1) * limit;
    const whereClause = search 
      ? or(
          like(billingPlans.name, `%${search}%`),
          like(billingPlans.planType, `%${search}%`),
          like(billingPlans.description, `%${search}%`)
        )
      : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(billingPlans)
      .where(whereClause);

    const plans = await db
      .select()
      .from(billingPlans)
      .where(whereClause)
      .orderBy(desc(billingPlans.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      billingPlans: plans,
      total: totalResult.count,
    };
  }

  async createBillingPlan(insertBillingPlan: InsertBillingPlan): Promise<BillingPlan> {
    const [billingPlan] = await db
      .insert(billingPlans)
      .values(insertBillingPlan)
      .returning();
    return billingPlan;
  }

  async updateBillingPlan(id: number, updateBillingPlan: Partial<InsertBillingPlan>): Promise<BillingPlan> {
    const [billingPlan] = await db
      .update(billingPlans)
      .set({ ...updateBillingPlan, updatedAt: new Date() })
      .where(eq(billingPlans.id, id))
      .returning();
    return billingPlan;
  }

  async deleteBillingPlan(id: number): Promise<void> {
    await db.delete(billingPlans).where(eq(billingPlans.id, id));
  }

  // Location Billing operations
  async getLocationBilling(id: number): Promise<LocationBilling | undefined> {
    const [locationBill] = await db.select().from(locationBilling).where(eq(locationBilling.id, id));
    return locationBill || undefined;
  }

  async getLocationBillings(page = 1, limit = 10, search = ""): Promise<{ locationBillings: LocationBilling[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const [totalResult] = await db
      .select({ count: count() })
      .from(locationBilling);

    const locationBillings = await db
      .select()
      .from(locationBilling)
      .orderBy(desc(locationBilling.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      locationBillings,
      total: totalResult.count,
    };
  }

  async getLocationBillingByLocation(locationId: number): Promise<LocationBilling | undefined> {
    const [locationBill] = await db
      .select()
      .from(locationBilling)
      .where(and(eq(locationBilling.locationId, locationId), eq(locationBilling.isActive, true)))
      .orderBy(desc(locationBilling.startDate));
    return locationBill || undefined;
  }

  async createLocationBilling(insertLocationBilling: InsertLocationBilling): Promise<LocationBilling> {
    const [locationBill] = await db
      .insert(locationBilling)
      .values(insertLocationBilling)
      .returning();
    return locationBill;
  }

  async updateLocationBilling(id: number, updateLocationBilling: Partial<InsertLocationBilling>): Promise<LocationBilling> {
    const [locationBill] = await db
      .update(locationBilling)
      .set({ ...updateLocationBilling, updatedAt: new Date() })
      .where(eq(locationBilling.id, id))
      .returning();
    return locationBill;
  }

  async deleteLocationBilling(id: number): Promise<void> {
    await db.delete(locationBilling).where(eq(locationBilling.id, id));
  }

  // Revenue Report operations
  async getRevenueReport(id: number): Promise<RevenueReport | undefined> {
    const [report] = await db.select().from(revenueReports).where(eq(revenueReports.id, id));
    return report || undefined;
  }

  async getRevenueReports(page = 1, limit = 10, search = ""): Promise<{ revenueReports: RevenueReport[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const [totalResult] = await db
      .select({ count: count() })
      .from(revenueReports);

    const reports = await db
      .select()
      .from(revenueReports)
      .orderBy(desc(revenueReports.reportDate))
      .limit(limit)
      .offset(offset);

    return {
      revenueReports: reports,
      total: totalResult.count,
    };
  }

  async getRevenueReportsByLocation(locationId: number, startDate?: Date, endDate?: Date): Promise<RevenueReport[]> {
    let whereClause = eq(revenueReports.locationId, locationId);
    
    if (startDate && endDate) {
      whereClause = and(
        eq(revenueReports.locationId, locationId),
        // Add date range filter here when needed
      ) as any;
    }

    return await db
      .select()
      .from(revenueReports)
      .where(whereClause)
      .orderBy(desc(revenueReports.reportDate));
  }

  async createRevenueReport(insertRevenueReport: InsertRevenueReport): Promise<RevenueReport> {
    const [report] = await db
      .insert(revenueReports)
      .values(insertRevenueReport)
      .returning();
    return report;
  }

  async updateRevenueReport(id: number, updateRevenueReport: Partial<InsertRevenueReport>): Promise<RevenueReport> {
    const [report] = await db
      .update(revenueReports)
      .set({ ...updateRevenueReport, updatedAt: new Date() })
      .where(eq(revenueReports.id, id))
      .returning();
    return report;
  }

  async deleteRevenueReport(id: number): Promise<void> {
    await db.delete(revenueReports).where(eq(revenueReports.id, id));
  }

  // Automated Bill operations
  async getAutomatedBill(id: number): Promise<AutomatedBill | undefined> {
    const [bill] = await db.select().from(automatedBills).where(eq(automatedBills.id, id));
    return bill || undefined;
  }

  async getAutomatedBills(page = 1, limit = 10, search = ""): Promise<{ automatedBills: AutomatedBill[]; total: number }> {
    const offset = (page - 1) * limit;
    const whereClause = search 
      ? or(
          like(automatedBills.billNumber, `%${search}%`),
          like(automatedBills.status, `%${search}%`)
        )
      : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(automatedBills)
      .where(whereClause);

    const bills = await db
      .select()
      .from(automatedBills)
      .where(whereClause)
      .orderBy(desc(automatedBills.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      automatedBills: bills,
      total: totalResult.count,
    };
  }

  async getAutomatedBillsByLocation(locationId: number): Promise<AutomatedBill[]> {
    return await db
      .select()
      .from(automatedBills)
      .where(eq(automatedBills.locationId, locationId))
      .orderBy(desc(automatedBills.createdAt));
  }

  async getPendingBills(): Promise<AutomatedBill[]> {
    return await db
      .select()
      .from(automatedBills)
      .where(eq(automatedBills.status, 'pending'))
      .orderBy(desc(automatedBills.dueDate));
  }

  async getOverdueBills(): Promise<AutomatedBill[]> {
    const now = new Date();
    return await db
      .select()
      .from(automatedBills)
      .where(and(
        eq(automatedBills.status, 'pending'),
        // Add overdue date logic here
      ))
      .orderBy(desc(automatedBills.dueDate));
  }

  async createAutomatedBill(insertAutomatedBill: InsertAutomatedBill): Promise<AutomatedBill> {
    const [bill] = await db
      .insert(automatedBills)
      .values(insertAutomatedBill)
      .returning();
    return bill;
  }

  async updateAutomatedBill(id: number, updateAutomatedBill: Partial<InsertAutomatedBill>): Promise<AutomatedBill> {
    const [bill] = await db
      .update(automatedBills)
      .set({ ...updateAutomatedBill, updatedAt: new Date() })
      .where(eq(automatedBills.id, id))
      .returning();
    return bill;
  }

  async deleteAutomatedBill(id: number): Promise<void> {
    await db.delete(automatedBills).where(eq(automatedBills.id, id));
  }

  async markBillAsPaid(id: number, paymentData: { paidAmount: string; paidDate: Date; paymentMethod: string; paymentReference?: string }): Promise<AutomatedBill> {
    const [bill] = await db
      .update(automatedBills)
      .set({
        status: 'paid',
        paidAmount: paymentData.paidAmount,
        paidDate: paymentData.paidDate,
        paymentMethod: paymentData.paymentMethod,
        paymentReference: paymentData.paymentReference,
        updatedAt: new Date()
      })
      .where(eq(automatedBills.id, id))
      .returning();
    return bill;
  }

  // Billing Schedule operations
  async getBillingSchedule(id: number): Promise<BillingSchedule | undefined> {
    const [schedule] = await db.select().from(billingSchedules).where(eq(billingSchedules.id, id));
    return schedule || undefined;
  }

  async getBillingSchedules(page = 1, limit = 10): Promise<{ billingSchedules: BillingSchedule[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const [totalResult] = await db
      .select({ count: count() })
      .from(billingSchedules);

    const schedules = await db
      .select()
      .from(billingSchedules)
      .orderBy(desc(billingSchedules.nextGenerationDate))
      .limit(limit)
      .offset(offset);

    return {
      billingSchedules: schedules,
      total: totalResult.count,
    };
  }

  async getActiveSchedules(): Promise<BillingSchedule[]> {
    return await db
      .select()
      .from(billingSchedules)
      .where(eq(billingSchedules.isActive, true))
      .orderBy(desc(billingSchedules.nextGenerationDate));
  }

  async getDueSchedules(): Promise<BillingSchedule[]> {
    const now = new Date();
    return await db
      .select()
      .from(billingSchedules)
      .where(and(
        eq(billingSchedules.isActive, true),
        // Add due date logic here
      ))
      .orderBy(desc(billingSchedules.nextGenerationDate));
  }

  async createBillingSchedule(insertBillingSchedule: InsertBillingSchedule): Promise<BillingSchedule> {
    const [schedule] = await db
      .insert(billingSchedules)
      .values(insertBillingSchedule)
      .returning();
    return schedule;
  }

  async updateBillingSchedule(id: number, updateBillingSchedule: Partial<InsertBillingSchedule>): Promise<BillingSchedule> {
    const [schedule] = await db
      .update(billingSchedules)
      .set({ ...updateBillingSchedule, updatedAt: new Date() })
      .where(eq(billingSchedules.id, id))
      .returning();
    return schedule;
  }

  async deleteBillingSchedule(id: number): Promise<void> {
    await db.delete(billingSchedules).where(eq(billingSchedules.id, id));
  }

  // Payment History operations
  async getPaymentHistory(id: number): Promise<PaymentHistory | undefined> {
    const [payment] = await db.select().from(paymentHistory).where(eq(paymentHistory.id, id));
    return payment || undefined;
  }

  async getPaymentHistories(page = 1, limit = 10): Promise<{ paymentHistories: PaymentHistory[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const [totalResult] = await db
      .select({ count: count() })
      .from(paymentHistory);

    const payments = await db
      .select()
      .from(paymentHistory)
      .orderBy(desc(paymentHistory.paymentDate))
      .limit(limit)
      .offset(offset);

    return {
      paymentHistories: payments,
      total: totalResult.count,
    };
  }

  async getPaymentHistoryByBill(automatedBillId: number): Promise<PaymentHistory[]> {
    return await db
      .select()
      .from(paymentHistory)
      .where(eq(paymentHistory.automatedBillId, automatedBillId))
      .orderBy(desc(paymentHistory.paymentDate));
  }

  async createPaymentHistory(insertPaymentHistory: InsertPaymentHistory): Promise<PaymentHistory> {
    const [payment] = await db
      .insert(paymentHistory)
      .values(insertPaymentHistory)
      .returning();
    return payment;
  }

  async deletePaymentHistory(id: number): Promise<void> {
    await db.delete(paymentHistory).where(eq(paymentHistory.id, id));
  }

  // Billing automation operations
  async generateBillsForDueSchedules(): Promise<AutomatedBill[]> {
    // This would contain the logic to automatically generate bills
    // based on due schedules. For now, return empty array.
    return [];
  }

  async calculateBillAmount(locationBillingId: number, startDate: Date, endDate: Date): Promise<{ baseRent: number; revenueShare: number; total: number }> {
    // This would contain the logic to calculate bill amounts
    // based on billing plan and revenue data. For now, return zero amounts.
    return { baseRent: 0, revenueShare: 0, total: 0 };
  }

  async getBillingDashboardStats(): Promise<any> {
    // Get billing dashboard statistics
    const [pendingBillsCount] = await db
      .select({ count: count() })
      .from(automatedBills)
      .where(eq(automatedBills.status, 'pending'));

    const [overdueBillsCount] = await db
      .select({ count: count() })
      .from(automatedBills)
      .where(eq(automatedBills.status, 'overdue'));

    const [totalBillsThisMonth] = await db
      .select({ count: count() })
      .from(automatedBills);

    return {
      pendingBills: pendingBillsCount.count,
      overdueBills: overdueBillsCount.count,
      totalBillsThisMonth: totalBillsThisMonth.count,
      totalRevenue: 0, // Calculate from revenue reports
      activeBillingPlans: 0, // Calculate from billing plans
    };
  }
}

export const storage = new DatabaseStorage();
