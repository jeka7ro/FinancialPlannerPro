import { users, companies, locations, userLocations, providers, cabinets, gameMixes, slots, invoices, rentAgreements, legalDocuments, onjnReports, activityLogs, attachments, } from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, and, like, count, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
export class DatabaseStorage {
    // User operations
    async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user || undefined;
    }
    async getUserByUsername(username) {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user || undefined;
    }
    async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user || undefined;
    }
    async createUser(insertUser) {
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
    async updateUser(id, updateUser) {
        const updateData = { ...updateUser, updatedAt: new Date() };
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
    async deleteUser(id) {
        await db.delete(users).where(eq(users.id, id));
    }
    async getUsers(page = 1, limit = 10, search = "") {
        const offset = (page - 1) * limit;
        const whereClause = search
            ? or(like(users.username, `%${search}%`), like(users.email, `%${search}%`), like(users.firstName, `%${search}%`), like(users.lastName, `%${search}%`), like(users.role, `%${search}%`))
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
    async getCompany(id) {
        const [company] = await db.select().from(companies).where(eq(companies.id, id));
        return company || undefined;
    }
    async getCompanies(page = 1, limit = 10, search = "") {
        const offset = (page - 1) * limit;
        const whereClause = search
            ? or(like(companies.name, `%${search}%`), like(companies.taxId, `%${search}%`), like(companies.address, `%${search}%`), like(companies.city, `%${search}%`), like(companies.country, `%${search}%`), like(companies.phone, `%${search}%`), like(companies.email, `%${search}%`), like(companies.website, `%${search}%`))
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
    async createCompany(insertCompany) {
        const [company] = await db
            .insert(companies)
            .values(insertCompany)
            .returning();
        return company;
    }
    async updateCompany(id, updateCompany) {
        const [company] = await db
            .update(companies)
            .set({ ...updateCompany, updatedAt: new Date() })
            .where(eq(companies.id, id))
            .returning();
        return company;
    }
    async deleteCompany(id) {
        await db.delete(companies).where(eq(companies.id, id));
    }
    // Location operations
    async getLocation(id) {
        const [location] = await db.select().from(locations).where(eq(locations.id, id));
        return location || undefined;
    }
    async getLocations(page = 1, limit = 10, search = "") {
        const offset = (page - 1) * limit;
        const whereClause = search
            ? or(like(locations.name, `%${search}%`), like(locations.address, `%${search}%`), like(locations.city, `%${search}%`), like(locations.country, `%${search}%`), like(locations.phone, `%${search}%`), like(locations.email, `%${search}%`))
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
    async createLocation(insertLocation) {
        const [location] = await db
            .insert(locations)
            .values(insertLocation)
            .returning();
        return location;
    }
    async updateLocation(id, updateLocation) {
        const [location] = await db
            .update(locations)
            .set({ ...updateLocation, updatedAt: new Date() })
            .where(eq(locations.id, id))
            .returning();
        return location;
    }
    async deleteLocation(id) {
        await db.delete(locations).where(eq(locations.id, id));
    }
    // User Location operations
    async getUserLocations(userId) {
        return await db.select().from(userLocations).where(eq(userLocations.userId, userId));
    }
    async assignUserToLocations(userId, locationIds) {
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
    async removeUserFromLocation(userId, locationId) {
        await db.delete(userLocations).where(and(eq(userLocations.userId, userId), eq(userLocations.locationId, locationId)));
    }
    async getUserAccessibleLocationIds(userId) {
        const userLocationData = await db
            .select({ locationId: userLocations.locationId })
            .from(userLocations)
            .where(eq(userLocations.userId, userId));
        return userLocationData.map(ul => ul.locationId);
    }
    // Provider operations
    async getProvider(id) {
        const [provider] = await db.select().from(providers).where(eq(providers.id, id));
        return provider || undefined;
    }
    async getProviders(page = 1, limit = 10, search = "") {
        const offset = (page - 1) * limit;
        const whereClause = search
            ? or(like(providers.name, `%${search}%`), like(providers.companyName, `%${search}%`), like(providers.contactPerson, `%${search}%`), like(providers.email, `%${search}%`), like(providers.phone, `%${search}%`), like(providers.address, `%${search}%`), like(providers.city, `%${search}%`), like(providers.country, `%${search}%`), like(providers.website, `%${search}%`))
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
    async createProvider(insertProvider) {
        const [provider] = await db
            .insert(providers)
            .values(insertProvider)
            .returning();
        return provider;
    }
    async updateProvider(id, updateProvider) {
        const [provider] = await db
            .update(providers)
            .set({ ...updateProvider, updatedAt: new Date() })
            .where(eq(providers.id, id))
            .returning();
        return provider;
    }
    async deleteProvider(id) {
        await db.delete(providers).where(eq(providers.id, id));
    }
    // Cabinet operations
    async getCabinet(id) {
        const [cabinet] = await db.select().from(cabinets).where(eq(cabinets.id, id));
        return cabinet || undefined;
    }
    async getCabinets(page = 1, limit = 10, search = "") {
        const offset = (page - 1) * limit;
        const whereClause = search
            ? or(like(cabinets.serialNumber, `%${search}%`), like(cabinets.model, `%${search}%`), like(cabinets.manufacturer, `%${search}%`), like(cabinets.status, `%${search}%`))
            : undefined;
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
    async createCabinet(insertCabinet) {
        const [cabinet] = await db
            .insert(cabinets)
            .values(insertCabinet)
            .returning();
        return cabinet;
    }
    async updateCabinet(id, updateCabinet) {
        const [cabinet] = await db
            .update(cabinets)
            .set({ ...updateCabinet, updatedAt: new Date() })
            .where(eq(cabinets.id, id))
            .returning();
        return cabinet;
    }
    async deleteCabinet(id) {
        await db.delete(cabinets).where(eq(cabinets.id, id));
    }
    // Game Mix operations
    async getGameMix(id) {
        const [gameMix] = await db.select().from(gameMixes).where(eq(gameMixes.id, id));
        return gameMix || undefined;
    }
    async getGameMixes(page = 1, limit = 10, search = "") {
        const offset = (page - 1) * limit;
        const whereClause = search
            ? or(like(gameMixes.name, `%${search}%`), like(gameMixes.description, `%${search}%`))
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
    async createGameMix(insertGameMix) {
        const [gameMix] = await db
            .insert(gameMixes)
            .values(insertGameMix)
            .returning();
        return gameMix;
    }
    async updateGameMix(id, updateGameMix) {
        const [gameMix] = await db
            .update(gameMixes)
            .set({ ...updateGameMix, updatedAt: new Date() })
            .where(eq(gameMixes.id, id))
            .returning();
        return gameMix;
    }
    async deleteGameMix(id) {
        await db.delete(gameMixes).where(eq(gameMixes.id, id));
    }
    // Slot operations
    async getSlot(id) {
        const [slot] = await db.select().from(slots).where(eq(slots.id, id));
        return slot || undefined;
    }
    async getSlots(page = 1, limit = 10, search = "") {
        const offset = (page - 1) * limit;
        const whereClause = search
            ? or(like(slots.serialNr, `%${search}%`), like(slots.exciterType, `%${search}%`), like(slots.propertyType, `%${search}%`))
            : undefined;
        const [totalResult] = await db
            .select({ count: count() })
            .from(slots)
            .where(whereClause);
        const slotsList = await db
            .select()
            .from(slots)
            .where(whereClause)
            .orderBy(desc(slots.createdAt))
            .limit(limit)
            .offset(offset);
        return {
            slots: slotsList,
            total: totalResult.count,
        };
    }
    async createSlot(insertSlot) {
        const [slot] = await db
            .insert(slots)
            .values(insertSlot)
            .returning();
        return slot;
    }
    async updateSlot(id, updateSlot) {
        const [slot] = await db
            .update(slots)
            .set({ ...updateSlot, updatedAt: new Date() })
            .where(eq(slots.id, id))
            .returning();
        return slot;
    }
    async deleteSlot(id) {
        await db.delete(slots).where(eq(slots.id, id));
    }
    // Invoice operations
    async getInvoice(id) {
        const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
        return invoice || undefined;
    }
    async getInvoices(page = 1, limit = 10, search = "") {
        const offset = (page - 1) * limit;
        const whereClause = search
            ? or(like(invoices.invoiceNumber, `%${search}%`), like(invoices.status, `%${search}%`), like(invoices.serialNumbers, `%${search}%`), like(invoices.propertyType, `%${search}%`), like(invoices.notes, `%${search}%`))
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
    async createInvoice(insertInvoice) {
        const [invoice] = await db
            .insert(invoices)
            .values(insertInvoice)
            .returning();
        return invoice;
    }
    async updateInvoice(id, updateInvoice) {
        const [invoice] = await db
            .update(invoices)
            .set({ ...updateInvoice, updatedAt: new Date() })
            .where(eq(invoices.id, id))
            .returning();
        return invoice;
    }
    async deleteInvoice(id) {
        await db.delete(invoices).where(eq(invoices.id, id));
    }
    // Rent Agreement operations
    async getRentAgreement(id) {
        const [rentAgreement] = await db.select().from(rentAgreements).where(eq(rentAgreements.id, id));
        return rentAgreement || undefined;
    }
    async getRentAgreements(page = 1, limit = 10, search = "") {
        const offset = (page - 1) * limit;
        const whereClause = search
            ? or(like(rentAgreements.agreementNumber, `%${search}%`), like(rentAgreements.status, `%${search}%`))
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
    async createRentAgreement(insertRentAgreement) {
        const [rentAgreement] = await db
            .insert(rentAgreements)
            .values(insertRentAgreement)
            .returning();
        return rentAgreement;
    }
    async updateRentAgreement(id, updateRentAgreement) {
        const [rentAgreement] = await db
            .update(rentAgreements)
            .set({ ...updateRentAgreement, updatedAt: new Date() })
            .where(eq(rentAgreements.id, id))
            .returning();
        return rentAgreement;
    }
    async deleteRentAgreement(id) {
        await db.delete(rentAgreements).where(eq(rentAgreements.id, id));
    }
    // Legal Document operations
    async getLegalDocument(id) {
        const [legalDocument] = await db.select().from(legalDocuments).where(eq(legalDocuments.id, id));
        return legalDocument || undefined;
    }
    async getLegalDocuments(page = 1, limit = 10, search = "") {
        const offset = (page - 1) * limit;
        const whereClause = search
            ? or(like(legalDocuments.title, `%${search}%`), like(legalDocuments.documentType, `%${search}%`), like(legalDocuments.status, `%${search}%`))
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
    async createLegalDocument(insertLegalDocument) {
        const [legalDocument] = await db
            .insert(legalDocuments)
            .values(insertLegalDocument)
            .returning();
        return legalDocument;
    }
    async updateLegalDocument(id, updateLegalDocument) {
        const [legalDocument] = await db
            .update(legalDocuments)
            .set({ ...updateLegalDocument, updatedAt: new Date() })
            .where(eq(legalDocuments.id, id))
            .returning();
        return legalDocument;
    }
    async deleteLegalDocument(id) {
        await db.delete(legalDocuments).where(eq(legalDocuments.id, id));
    }
    // ONJN Report operations
    async getOnjnReport(id) {
        const [onjnReport] = await db.select().from(onjnReports).where(eq(onjnReports.id, id));
        return onjnReport || undefined;
    }
    async getOnjnReports(page = 1, limit = 10, search = "") {
        const offset = (page - 1) * limit;
        const whereClause = search
            ? or(like(onjnReports.serialNumbers, `%${search}%`), like(onjnReports.notes, `%${search}%`))
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
    async createOnjnReport(insertOnjnReport) {
        const { commissionDate, ...insertOnjnReportClean } = insertOnjnReport;
        const [onjnReport] = await db
            .insert(onjnReports)
            .values(insertOnjnReportClean)
            .returning();
        return onjnReport;
    }
    async updateOnjnReport(id, update) {
        const { commissionDate: cd, ...updateOnjnReportClean } = update;
        const [updatedReport] = await db
            .update(onjnReports)
            .set({ ...updateOnjnReportClean, updatedAt: new Date() })
            .where(eq(onjnReports.id, id))
            .returning();
        return updatedReport;
    }
    async deleteOnjnReport(id) {
        await db.delete(onjnReports).where(eq(onjnReports.id, id));
    }
    // Activity Log operations
    async createActivityLog(insertActivityLog) {
        const [activityLog] = await db
            .insert(activityLogs)
            .values(insertActivityLog)
            .returning();
        return activityLog;
    }
    async getActivityLogs(page = 1, limit = 10) {
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
    async getDashboardStats() {
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
    async getAttachments(entityType, entityId) {
        return await db
            .select()
            .from(attachments)
            .where(and(eq(attachments.entityType, entityType), eq(attachments.entityId, entityId)))
            .orderBy(desc(attachments.createdAt));
    }
    async createAttachment(insertAttachment) {
        const [attachment] = await db
            .insert(attachments)
            .values(insertAttachment)
            .returning();
        return attachment;
    }
    async deleteAttachment(id) {
        await db.delete(attachments).where(eq(attachments.id, id));
    }
}
export const storage = new DatabaseStorage();
