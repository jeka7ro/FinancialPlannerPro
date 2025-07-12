import {
  users,
  companies,
  locations,
  userLocations,
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
  type User,
  type InsertUser,
  type Company,
  type InsertCompany,
  type Location,
  type InsertLocation,
  type UserLocation,
  type InsertUserLocation,
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
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, and, like, count, or, asc, sql, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  authenticateUser(username: string, password: string): Promise<User | null>;
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
  bulkDeleteCompanies(ids: number[]): Promise<void>;

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
  getCabinets(page?: number, limit?: number, search?: string, providers?: string, models?: string): Promise<{ cabinets: Cabinet[]; total: number }>;
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
  getSlots(page?: number, limit?: number, search?: string, sortField?: string, sortDirection?: string): Promise<{ slots: Slot[]; total: number }>;
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
  createActivityLog(activityLog: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(page?: number, limit?: number): Promise<{ activityLogs: ActivityLog[]; total: number }>;

  // Dashboard operations
  getDashboardStats(): Promise<any>;

  // File attachment operations
  getAttachment(id: number): Promise<Attachment | undefined>;
  getAttachmentByFilename(filename: string): Promise<Attachment | undefined>;
  getAttachments(entityType: string, entityId: number): Promise<Attachment[]>;
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  deleteAttachment(id: number): Promise<void>;

  // User Location operations
  getUserLocations(userId: number): Promise<UserLocation[]>;
  assignUserToLocations(userId: number, locationIds: number[]): Promise<void>;
  removeUserFromLocation(userId: number, locationId: number): Promise<void>;
  getUserAccessibleLocationIds(userId: number): Promise<number[]>;
  getUserLocationsWithDetails(userId: number): Promise<Location[]>;
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

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid ? user : null;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User> {
    const updateData: any = { ...updateUser, updatedAt: new Date() };
    
    // Hash password if provided
    if (updateUser.password) {
      updateData.password = await bcrypt.hash(updateUser.password, 10);
    }
    
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
          // Use ILIKE for case-insensitive search
          sql`${users.username} ILIKE ${'%' + search + '%'}`,
          sql`${users.email} ILIKE ${'%' + search + '%'}`,
          sql`${users.firstName} ILIKE ${'%' + search + '%'}`,
          sql`${users.lastName} ILIKE ${'%' + search + '%'}`,
          sql`${users.role} ILIKE ${'%' + search + '%'}`,
          sql`${users.telephone} ILIKE ${'%' + search + '%'}`,
          // Numeric fields (if search is a number)
          ...((!isNaN(Number(search)) && search.trim() !== '') ? [
            sql`${users.id} = ${Number(search)}`
          ] : [])
        )
      : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause);

    const usersList = await db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      users: usersList,
      total: totalResult.count,
    };
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
          // Use ILIKE for case-insensitive search
          sql`${companies.name} ILIKE ${'%' + search + '%'}`,
          sql`${companies.registrationNumber} ILIKE ${'%' + search + '%'}`,
          sql`${companies.taxId} ILIKE ${'%' + search + '%'}`,
          sql`${companies.address} ILIKE ${'%' + search + '%'}`,
          sql`${companies.city} ILIKE ${'%' + search + '%'}`,
          sql`${companies.country} ILIKE ${'%' + search + '%'}`,
          sql`${companies.phone} ILIKE ${'%' + search + '%'}`,
          sql`${companies.email} ILIKE ${'%' + search + '%'}`,
          sql`${companies.website} ILIKE ${'%' + search + '%'}`,
          // Numeric fields (if search is a number)
          ...((!isNaN(Number(search)) && search.trim() !== '') ? [
            sql`${companies.id} = ${Number(search)}`
          ] : [])
        )
      : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(companies)
      .where(whereClause);

    const companiesList = await db
      .select()
      .from(companies)
      .where(whereClause)
      .orderBy(desc(companies.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      companies: companiesList,
      total: totalResult.count,
    };
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

  async bulkDeleteCompanies(ids: number[]): Promise<void> {
    await db.delete(companies).where(inArray(companies.id, ids));
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
          // Location fields - Use ILIKE for case-insensitive search
          sql`${locations.name} ILIKE ${'%' + search + '%'}`,
          sql`${locations.address} ILIKE ${'%' + search + '%'}`,
          sql`${locations.city} ILIKE ${'%' + search + '%'}`,
          sql`${locations.county} ILIKE ${'%' + search + '%'}`,
          sql`${locations.country} ILIKE ${'%' + search + '%'}`,
          sql`${locations.phone} ILIKE ${'%' + search + '%'}`,
          sql`${locations.email} ILIKE ${'%' + search + '%'}`,
          // Company name search (join with companies)
          sql`EXISTS (
            SELECT 1 FROM ${companies} c 
            WHERE c.id = ${locations.companyId} 
            AND c.name ILIKE ${'%' + search + '%'}
          )`,
          // Manager name search (join with users)
          sql`EXISTS (
            SELECT 1 FROM ${users} u 
            WHERE u.id = ${locations.managerId} 
            AND (
              u.username ILIKE ${'%' + search + '%'} OR 
              u.first_name ILIKE ${'%' + search + '%'} OR
              u.last_name ILIKE ${'%' + search + '%'}
            )
          )`,
          // Numeric fields (if search is a number)
          ...((!isNaN(Number(search)) && search.trim() !== '') ? [
            sql`${locations.id} = ${Number(search)}`,
            sql`${locations.companyId} = ${Number(search)}`,
            sql`${locations.managerId} = ${Number(search)}`
          ] : [])
        )
      : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(locations)
      .where(whereClause);

    const locationsList = await db
      .select()
      .from(locations)
      .where(whereClause)
      .orderBy(desc(locations.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      locations: locationsList,
      total: totalResult.count,
    };
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

  // User Location operations
  async getUserLocations(userId: number): Promise<UserLocation[]> {
    return await db.select().from(userLocations).where(eq(userLocations.userId, userId));
  }

  // Returns full location details for a user
  async getUserLocationsWithDetails(userId: number): Promise<Location[]> {
    return await db
      .select({
        id: locations.id,
        companyId: locations.companyId,
        name: locations.name,
        address: locations.address,
        city: locations.city,
        county: locations.county,
        country: locations.country,
        phone: locations.phone,
        email: locations.email,
        managerId: locations.managerId,
        latitude: locations.latitude,
        longitude: locations.longitude,
        isActive: locations.isActive,
        createdAt: locations.createdAt,
        updatedAt: locations.updatedAt,
        postalCode: locations.postalCode,
        status: locations.status
      })
      .from(userLocations)
      .innerJoin(locations, eq(userLocations.locationId, locations.id))
      .where(eq(userLocations.userId, userId));
  }

  async assignUserToLocations(userId: number, locationIds: number[]): Promise<void> {
    // First, remove existing user-location assignments
    await db.delete(userLocations).where(eq(userLocations.userId, userId));
    
    // Then, add new assignments
    if (locationIds.length > 0) {
      const assignments = locationIds.map(locationId => ({
        userId,
        locationId
      }));
      await db.insert(userLocations).values(assignments);
    }
  }

  async removeUserFromLocation(userId: number, locationId: number): Promise<void> {
    await db.delete(userLocations).where(
      and(
        eq(userLocations.userId, userId),
        eq(userLocations.locationId, locationId)
      )
    );
  }

  async getUserAccessibleLocationIds(userId: number): Promise<number[]> {
    const userLocationData = await db
      .select({ locationId: userLocations.locationId })
      .from(userLocations)
      .where(eq(userLocations.userId, userId));
    
    return userLocationData.map(ul => ul.locationId);
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
          // Use ILIKE for case-insensitive search
          sql`${providers.name} ILIKE ${'%' + search + '%'}`,
          sql`${providers.companyName} ILIKE ${'%' + search + '%'}`,
          sql`${providers.contactPerson} ILIKE ${'%' + search + '%'}`,
          sql`${providers.email} ILIKE ${'%' + search + '%'}`,
          sql`${providers.phone} ILIKE ${'%' + search + '%'}`,
          sql`${providers.address} ILIKE ${'%' + search + '%'}`,
          sql`${providers.city} ILIKE ${'%' + search + '%'}`,
          sql`${providers.country} ILIKE ${'%' + search + '%'}`,
          sql`${providers.website} ILIKE ${'%' + search + '%'}`,
          // Numeric fields (if search is a number)
          ...((!isNaN(Number(search)) && search.trim() !== '') ? [
            sql`${providers.id} = ${Number(search)}`
          ] : [])
        )
      : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(providers)
      .where(whereClause);

    const providersList = await db
      .select()
      .from(providers)
      .where(whereClause)
      .orderBy(desc(providers.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      providers: providersList,
      total: totalResult.count,
    };
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

  async getCabinets(page = 1, limit = 10, search = "", providers = "", models = ""): Promise<{ cabinets: Cabinet[]; total: number }> {
    const offset = (page - 1) * limit;
    
    // Parse provider IDs from comma-separated string
    const providerIds = providers ? providers.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
    
    // Parse model names from comma-separated string
    const modelNames = models ? models.split(',').map(name => name.trim()).filter(name => name.length > 0) : [];
    
    // Create comprehensive search condition for all relevant fields
    const searchConditions = search ? [
      // Cabinet fields - Use ILIKE for case-insensitive search
      sql`${cabinets.serialNumber} ILIKE ${'%' + search + '%'}`,
      sql`${cabinets.model} ILIKE ${'%' + search + '%'}`,
      sql`${cabinets.manufacturer} ILIKE ${'%' + search + '%'}`,
      sql`${cabinets.status} ILIKE ${'%' + search + '%'}`,
      // Provider name search (join with providers)
      sql`EXISTS (
        SELECT 1 FROM ${providers} p 
        WHERE p.id = ${cabinets.providerId} 
        AND p.name ILIKE ${'%' + search + '%'}
      )`,
      // Numeric fields (if search is a number)
      ...((!isNaN(Number(search)) && search.trim() !== '') ? [
        sql`${cabinets.id} = ${Number(search)}`,
        sql`${cabinets.providerId} = ${Number(search)}`,
        sql`${cabinets.locationId} = ${Number(search)}`
      ] : [])
    ] : [];
    
    // Add provider filter condition
    const providerConditions = providerIds.length > 0 ? [
      sql`${cabinets.providerId} IN (${sql.join(providerIds.map(id => sql`${id}`), sql`, `)})`
    ] : [];
    
    // Add model filter condition
    const modelConditions = modelNames.length > 0 ? [
      sql`${cabinets.model} IN (${sql.join(modelNames.map(name => sql`${name}`), sql`, `)})`
    ] : [];
    
    // Build where clause with proper logic
    let whereClause: any = undefined;
    
    const allConditions = [
      ...(searchConditions.length > 0 ? [or(...searchConditions)] : []),
      ...(providerConditions.length > 0 ? providerConditions : []),
      ...(modelConditions.length > 0 ? modelConditions : [])
    ];
    
    if (allConditions.length > 0) {
      whereClause = and(...allConditions);
    }

    const [totalResult] = await db
      .select({ count: count() })
      .from(cabinets)
      .where(whereClause);

    const cabinetsList = await db
      .select()
      .from(cabinets)
      .where(whereClause)
      .orderBy(desc(cabinets.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      cabinets: cabinetsList,
      total: totalResult.count,
    };
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
          // Use ILIKE for case-insensitive search
          sql`${gameMixes.name} ILIKE ${'%' + search + '%'}`,
          sql`${gameMixes.description} ILIKE ${'%' + search + '%'}`,
          // Numeric fields (if search is a number)
          ...((!isNaN(Number(search)) && search.trim() !== '') ? [
            sql`${gameMixes.id} = ${Number(search)}`
          ] : [])
        )
      : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(gameMixes)
      .where(whereClause);

    const gameMixesList = await db
      .select()
      .from(gameMixes)
      .where(whereClause)
      .orderBy(desc(gameMixes.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      gameMixes: gameMixesList,
      total: totalResult.count,
    };
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

  async getSlots(page = 1, limit = 10, search = "", sortField = "id", sortDirection = "asc"): Promise<{ slots: Slot[]; total: number }> {
    const offset = (page - 1) * limit;
    
    // Create comprehensive search condition for all relevant fields
    const whereClause = search ? or(
      // Slot fields - Use ILIKE for case-insensitive search
      sql`${slots.serialNr} ILIKE ${'%' + search + '%'}`,
      sql`${slots.model} ILIKE ${'%' + search + '%'}`,
      sql`${slots.manufacturer} ILIKE ${'%' + search + '%'}`,
      sql`${slots.status} ILIKE ${'%' + search + '%'}`,
      // Cabinet model search (join with cabinets)
      sql`EXISTS (
        SELECT 1 FROM ${cabinets} c 
        WHERE c.id = ${slots.cabinetId} 
        AND c.model ILIKE ${'%' + search + '%'}
      )`,
      // Game Mix name search (join with gameMixes)
      sql`EXISTS (
        SELECT 1 FROM ${gameMixes} g 
        WHERE g.id = ${slots.gameMixId} 
        AND g.name ILIKE ${'%' + search + '%'}
      )`,
      // Numeric fields (if search is a number)
      ...((!isNaN(Number(search)) && search.trim() !== '') ? [
        sql`${slots.id} = ${Number(search)}`,
        sql`${slots.cabinetId} = ${Number(search)}`,
        sql`${slots.gameMixId} = ${Number(search)}`
      ] : [])
    ) : undefined;

    // Dynamic sorting
    const sortColumn = slots[sortField as keyof typeof slots] || slots.id;
    const sortOrder = sortDirection === 'desc' ? desc(slots.id) : asc(slots.id);

    const [totalResult] = await db
      .select({ count: count() })
      .from(slots)
      .where(whereClause);

    const slotsList = await db
      .select()
      .from(slots)
      .where(whereClause)
      .orderBy(sortOrder)
      .limit(limit)
      .offset(offset);

    return {
      slots: slotsList,
      total: totalResult.count,
    };
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
          // Use ILIKE for case-insensitive search
          sql`${invoices.invoiceNumber} ILIKE ${'%' + search + '%'}`,
          sql`${invoices.status} ILIKE ${'%' + search + '%'}`,
          sql`${invoices.propertyType} ILIKE ${'%' + search + '%'}`,
          sql`${invoices.currency} ILIKE ${'%' + search + '%'}`,
          sql`${invoices.serialNumbers} ILIKE ${'%' + search + '%'}`,
          // Company name search (join with companies)
          sql`EXISTS (
            SELECT 1 FROM ${companies} c 
            WHERE c.id = ${invoices.companyId} 
            AND c.name ILIKE ${'%' + search + '%'}
          )`,
          sql`EXISTS (
            SELECT 1 FROM ${companies} c 
            WHERE c.id = ${invoices.sellerCompanyId} 
            AND c.name ILIKE ${'%' + search + '%'}
          )`,
          // Numeric fields (if search is a number)
          ...((!isNaN(Number(search)) && search.trim() !== '') ? [
            sql`${invoices.id} = ${Number(search)}`,
            sql`${invoices.companyId} = ${Number(search)}`,
            sql`${invoices.sellerCompanyId} = ${Number(search)}`,
            sql`${invoices.createdBy} = ${Number(search)}`
          ] : [])
        )
      : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(invoices)
      .where(whereClause);

    const invoicesList = await db
      .select()
      .from(invoices)
      .where(whereClause)
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      invoices: invoicesList,
      total: totalResult.count,
    };
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
          // Use ILIKE for case-insensitive search
          sql`${rentAgreements.agreementNumber} ILIKE ${'%' + search + '%'}`,
          sql`${rentAgreements.status} ILIKE ${'%' + search + '%'}`,
          sql`${rentAgreements.currency} ILIKE ${'%' + search + '%'}`,
          // Company name search (join with companies)
          sql`EXISTS (
            SELECT 1 FROM ${companies} c 
            WHERE c.id = ${rentAgreements.companyId} 
            AND c.name ILIKE ${'%' + search + '%'}
          )`,
          // Numeric fields (if search is a number)
          ...((!isNaN(Number(search)) && search.trim() !== '') ? [
            sql`${rentAgreements.id} = ${Number(search)}`,
            sql`${rentAgreements.companyId} = ${Number(search)}`,
            sql`${rentAgreements.createdBy} = ${Number(search)}`
          ] : [])
        )
      : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(rentAgreements)
      .where(whereClause);

    const rentAgreementsList = await db
      .select()
      .from(rentAgreements)
      .where(whereClause)
      .orderBy(desc(rentAgreements.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      rentAgreements: rentAgreementsList,
      total: totalResult.count,
    };
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
          // Use ILIKE for case-insensitive search
          sql`${legalDocuments.title} ILIKE ${'%' + search + '%'}`,
          sql`${legalDocuments.description} ILIKE ${'%' + search + '%'}`,
          sql`${legalDocuments.documentType} ILIKE ${'%' + search + '%'}`,
          sql`${legalDocuments.status} ILIKE ${'%' + search + '%'}`,
          // Numeric fields (if search is a number)
          ...((!isNaN(Number(search)) && search.trim() !== '') ? [
            sql`${legalDocuments.id} = ${Number(search)}`,
            sql`${legalDocuments.createdBy} = ${Number(search)}`
          ] : [])
        )
      : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(legalDocuments)
      .where(whereClause);

    const legalDocumentsList = await db
      .select()
      .from(legalDocuments)
      .where(whereClause)
      .orderBy(desc(legalDocuments.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      legalDocuments: legalDocumentsList,
      total: totalResult.count,
    };
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
          // Use ILIKE for case-insensitive search
          sql`${onjnReports.reportNumber} ILIKE ${'%' + search + '%'}`,
          sql`${onjnReports.reportType} ILIKE ${'%' + search + '%'}`,
          sql`${onjnReports.status} ILIKE ${'%' + search + '%'}`,
          sql`${onjnReports.description} ILIKE ${'%' + search + '%'}`,
          // Company name search (join with companies)
          sql`EXISTS (
            SELECT 1 FROM ${companies} c 
            WHERE c.id = ${onjnReports.companyId} 
            AND c.name ILIKE ${'%' + search + '%'}
          )`,
          // Numeric fields (if search is a number)
          ...((!isNaN(Number(search)) && search.trim() !== '') ? [
            sql`${onjnReports.id} = ${Number(search)}`,
            sql`${onjnReports.companyId} = ${Number(search)}`,
            sql`${onjnReports.id} = ${Number(search)}`
          ] : [])
        )
      : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(onjnReports)
      .where(whereClause);

    const onjnReportsList = await db
      .select()
      .from(onjnReports)
      .where(whereClause)
      .orderBy(desc(onjnReports.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      onjnReports: onjnReportsList,
      total: totalResult.count,
    };
  }

  async createOnjnReport(insertOnjnReport: InsertOnjnReport): Promise<OnjnReport> {
    const { commissionDate, ...insertOnjnReportClean } = insertOnjnReport;
    const [onjnReport] = await db
      .insert(onjnReports)
      .values(insertOnjnReportClean)
      .returning();
    return onjnReport;
  }

  async updateOnjnReport(id: number, updateOnjnReport: Partial<InsertOnjnReport>): Promise<OnjnReport> {
    const { commissionDate: cd, ...updateOnjnReportClean } = updateOnjnReport;
    const [onjnReport] = await db
      .update(onjnReports)
      .set({ ...updateOnjnReportClean, updatedAt: new Date() })
      .where(eq(onjnReports.id, id))
      .returning();
    return onjnReport;
  }

  async deleteOnjnReport(id: number): Promise<void> {
    await db.delete(onjnReports).where(eq(onjnReports.id, id));
  }

  // Activity Log operations
  async createActivityLog(insertActivityLog: InsertActivityLog): Promise<ActivityLog> {
    const [activityLog] = await db
      .insert(activityLogs)
      .values(insertActivityLog)
      .returning();
    return activityLog;
  }

  async getActivityLogs(page = 1, limit = 10): Promise<{ activityLogs: ActivityLog[]; total: number }> {
    const offset = (page - 1) * limit;

    const [totalResult] = await db
      .select({ count: count() })
      .from(activityLogs);

    const activityLogsList = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit)
      .offset(offset);

    return {
      activityLogs: activityLogsList,
      total: totalResult.count,
    };
  }

  // Dashboard operations
  async getDashboardStats(): Promise<any> {
    const [totalRevenueResult] = await db
      .select({ count: count() })
      .from(invoices);

    const [activeCabinetsResult] = await db
      .select({ count: count() })
      .from(cabinets)
      .where(eq(cabinets.status, "active"));

    const [locationsResult] = await db
      .select({ count: count() })
      .from(locations);

    const [slotsResult] = await db
      .select({ count: count() })
      .from(slots);

    return {
      totalRevenue: totalRevenueResult.count,
      activeCabinets: activeCabinetsResult.count,
      activeLocations: locationsResult.count,
      totalSlots: slotsResult.count,
    };
  }

  // File attachment operations
  async getAttachment(id: number): Promise<Attachment | undefined> {
    const [attachment] = await db.select().from(attachments).where(eq(attachments.id, id));
    return attachment || undefined;
  }

  async getAttachmentByFilename(filename: string): Promise<Attachment | undefined> {
    const [attachment] = await db.select().from(attachments).where(eq(attachments.filename, filename));
    return attachment || undefined;
  }

  async getAttachments(entityType: string, entityId: number): Promise<Attachment[]> {
    return await db
      .select()
      .from(attachments)
      .where(
        and(
          eq(attachments.entityType, entityType),
          eq(attachments.entityId, entityId)
        )
      )
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