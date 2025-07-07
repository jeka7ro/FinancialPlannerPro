import { users, companies, locations, userLocations, providers, cabinets, gameMixes, slots, invoices, rentAgreements, legalDocuments, onjnReports, activityLogs, attachments, } from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, and, count, or, asc, sql, inArray } from "drizzle-orm";
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
    async authenticateUser(username, password) {
        const user = await this.getUserByUsername(username);
        if (!user)
            return null;
        const isPasswordValid = await bcrypt.compare(password, user.password);
        return isPasswordValid ? user : null;
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
            ? or(
            // Use ILIKE for case-insensitive search
            sql `${users.username} ILIKE ${'%' + search + '%'}`, sql `${users.email} ILIKE ${'%' + search + '%'}`, sql `${users.firstName} ILIKE ${'%' + search + '%'}`, sql `${users.lastName} ILIKE ${'%' + search + '%'}`, sql `${users.role} ILIKE ${'%' + search + '%'}`, sql `${users.telephone} ILIKE ${'%' + search + '%'}`, 
            // Numeric fields (if search is a number)
            ...((!isNaN(Number(search)) && search.trim() !== '') ? [
                sql `${users.id} = ${Number(search)}`
            ] : []))
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
            ? or(
            // Use ILIKE for case-insensitive search
            sql `${companies.name} ILIKE ${'%' + search + '%'}`, sql `${companies.registrationNumber} ILIKE ${'%' + search + '%'}`, sql `${companies.taxId} ILIKE ${'%' + search + '%'}`, sql `${companies.address} ILIKE ${'%' + search + '%'}`, sql `${companies.city} ILIKE ${'%' + search + '%'}`, sql `${companies.country} ILIKE ${'%' + search + '%'}`, sql `${companies.phone} ILIKE ${'%' + search + '%'}`, sql `${companies.email} ILIKE ${'%' + search + '%'}`, sql `${companies.website} ILIKE ${'%' + search + '%'}`, 
            // Numeric fields (if search is a number)
            ...((!isNaN(Number(search)) && search.trim() !== '') ? [
                sql `${companies.id} = ${Number(search)}`
            ] : []))
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
    async bulkDeleteCompanies(ids) {
        await db.delete(companies).where(inArray(companies.id, ids));
    }
    // Location operations
    async getLocation(id) {
        const [location] = await db.select().from(locations).where(eq(locations.id, id));
        return location || undefined;
    }
    async getLocations(page = 1, limit = 10, search = "") {
        const offset = (page - 1) * limit;
        const whereClause = search
            ? or(
            // Location fields - Use ILIKE for case-insensitive search
            sql `${locations.name} ILIKE ${'%' + search + '%'}`, sql `${locations.address} ILIKE ${'%' + search + '%'}`, sql `${locations.city} ILIKE ${'%' + search + '%'}`, sql `${locations.county} ILIKE ${'%' + search + '%'}`, sql `${locations.country} ILIKE ${'%' + search + '%'}`, sql `${locations.phone} ILIKE ${'%' + search + '%'}`, sql `${locations.email} ILIKE ${'%' + search + '%'}`, 
            // Company name search (join with companies)
            sql `EXISTS (
            SELECT 1 FROM ${companies} c 
            WHERE c.id = ${locations.companyId} 
            AND c.name ILIKE ${'%' + search + '%'}
          )`, 
            // Manager name search (join with users)
            sql `EXISTS (
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
                sql `${locations.id} = ${Number(search)}`,
                sql `${locations.companyId} = ${Number(search)}`,
                sql `${locations.managerId} = ${Number(search)}`
            ] : []))
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
            ? or(
            // Use ILIKE for case-insensitive search
            sql `${providers.name} ILIKE ${'%' + search + '%'}`, sql `${providers.companyName} ILIKE ${'%' + search + '%'}`, sql `${providers.contactPerson} ILIKE ${'%' + search + '%'}`, sql `${providers.email} ILIKE ${'%' + search + '%'}`, sql `${providers.phone} ILIKE ${'%' + search + '%'}`, sql `${providers.address} ILIKE ${'%' + search + '%'}`, sql `${providers.city} ILIKE ${'%' + search + '%'}`, sql `${providers.country} ILIKE ${'%' + search + '%'}`, sql `${providers.website} ILIKE ${'%' + search + '%'}`, 
            // Numeric fields (if search is a number)
            ...((!isNaN(Number(search)) && search.trim() !== '') ? [
                sql `${providers.id} = ${Number(search)}`
            ] : []))
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
    async getCabinets(page = 1, limit = 10, search = "", providers = "", models = "") {
        const offset = (page - 1) * limit;
        // Parse provider IDs from comma-separated string
        const providerIds = providers ? providers.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
        // Parse model names from comma-separated string
        const modelNames = models ? models.split(',').map(name => name.trim()).filter(name => name.length > 0) : [];
        // Create comprehensive search condition for all relevant fields
        const searchConditions = search ? [
            // Cabinet fields - Use ILIKE for case-insensitive search
            sql `${cabinets.serialNumber} ILIKE ${'%' + search + '%'}`,
            sql `${cabinets.model} ILIKE ${'%' + search + '%'}`,
            sql `${cabinets.manufacturer} ILIKE ${'%' + search + '%'}`,
            sql `${cabinets.status} ILIKE ${'%' + search + '%'}`,
            // Provider name search (join with providers)
            sql `EXISTS (
        SELECT 1 FROM ${providers} p 
        WHERE p.id = ${cabinets.providerId} 
        AND p.name ILIKE ${'%' + search + '%'}
      )`,
            // Numeric fields (if search is a number)
            ...((!isNaN(Number(search)) && search.trim() !== '') ? [
                sql `${cabinets.id} = ${Number(search)}`,
                sql `${cabinets.providerId} = ${Number(search)}`,
                sql `${cabinets.locationId} = ${Number(search)}`
            ] : [])
        ] : [];
        // Add provider filter condition
        const providerConditions = providerIds.length > 0 ? [
            sql `${cabinets.providerId} IN (${sql.join(providerIds.map(id => sql `${id}`), sql `, `)})`
        ] : [];
        // Add model filter condition
        const modelConditions = modelNames.length > 0 ? [
            sql `${cabinets.model} IN (${sql.join(modelNames.map(name => sql `${name}`), sql `, `)})`
        ] : [];
        // Build where clause with proper logic
        let whereClause = undefined;
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
            ? or(
            // Use ILIKE for case-insensitive search
            sql `${gameMixes.name} ILIKE ${'%' + search + '%'}`, sql `${gameMixes.description} ILIKE ${'%' + search + '%'}`, 
            // Numeric fields (if search is a number)
            ...((!isNaN(Number(search)) && search.trim() !== '') ? [
                sql `${gameMixes.id} = ${Number(search)}`
            ] : []))
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
    async getSlots(page = 1, limit = 10, search = "", sortField = "id", sortDirection = "asc") {
        const offset = (page - 1) * limit;
        // Create comprehensive search condition for all relevant fields
        const whereClause = search ? or(
        // Slot fields - Use ILIKE for case-insensitive search
        sql `${slots.serialNr} ILIKE ${'%' + search + '%'}`, sql `${slots.model} ILIKE ${'%' + search + '%'}`, sql `${slots.manufacturer} ILIKE ${'%' + search + '%'}`, sql `${slots.status} ILIKE ${'%' + search + '%'}`, 
        // Cabinet model search (join with cabinets)
        sql `EXISTS (
        SELECT 1 FROM ${cabinets} c 
        WHERE c.id = ${slots.cabinetId} 
        AND c.model ILIKE ${'%' + search + '%'}
      )`, 
        // Game Mix name search (join with gameMixes)
        sql `EXISTS (
        SELECT 1 FROM ${gameMixes} g 
        WHERE g.id = ${slots.gameMixId} 
        AND g.name ILIKE ${'%' + search + '%'}
      )`, 
        // Numeric fields (if search is a number)
        ...((!isNaN(Number(search)) && search.trim() !== '') ? [
            sql `${slots.id} = ${Number(search)}`,
            sql `${slots.cabinetId} = ${Number(search)}`,
            sql `${slots.gameMixId} = ${Number(search)}`
        ] : [])) : undefined;
        // Dynamic sorting
        const sortColumn = slots[sortField] || slots.id;
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
            ? or(
            // Use ILIKE for case-insensitive search
            sql `${invoices.invoiceNumber} ILIKE ${'%' + search + '%'}`, sql `${invoices.status} ILIKE ${'%' + search + '%'}`, sql `${invoices.propertyType} ILIKE ${'%' + search + '%'}`, sql `${invoices.currency} ILIKE ${'%' + search + '%'}`, sql `${invoices.serialNumbers} ILIKE ${'%' + search + '%'}`, 
            // Company name search (join with companies)
            sql `EXISTS (
            SELECT 1 FROM ${companies} c 
            WHERE c.id = ${invoices.companyId} 
            AND c.name ILIKE ${'%' + search + '%'}
          )`, sql `EXISTS (
            SELECT 1 FROM ${companies} c 
            WHERE c.id = ${invoices.sellerCompanyId} 
            AND c.name ILIKE ${'%' + search + '%'}
          )`, 
            // Numeric fields (if search is a number)
            ...((!isNaN(Number(search)) && search.trim() !== '') ? [
                sql `${invoices.id} = ${Number(search)}`,
                sql `${invoices.companyId} = ${Number(search)}`,
                sql `${invoices.sellerCompanyId} = ${Number(search)}`,
                sql `${invoices.createdBy} = ${Number(search)}`
            ] : []))
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
            ? or(
            // Use ILIKE for case-insensitive search
            sql `${rentAgreements.agreementNumber} ILIKE ${'%' + search + '%'}`, sql `${rentAgreements.status} ILIKE ${'%' + search + '%'}`, sql `${rentAgreements.currency} ILIKE ${'%' + search + '%'}`, 
            // Company name search (join with companies)
            sql `EXISTS (
            SELECT 1 FROM ${companies} c 
            WHERE c.id = ${rentAgreements.companyId} 
            AND c.name ILIKE ${'%' + search + '%'}
          )`, 
            // Numeric fields (if search is a number)
            ...((!isNaN(Number(search)) && search.trim() !== '') ? [
                sql `${rentAgreements.id} = ${Number(search)}`,
                sql `${rentAgreements.companyId} = ${Number(search)}`,
                sql `${rentAgreements.createdBy} = ${Number(search)}`
            ] : []))
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
            ? or(
            // Use ILIKE for case-insensitive search
            sql `${legalDocuments.title} ILIKE ${'%' + search + '%'}`, sql `${legalDocuments.description} ILIKE ${'%' + search + '%'}`, sql `${legalDocuments.documentType} ILIKE ${'%' + search + '%'}`, sql `${legalDocuments.status} ILIKE ${'%' + search + '%'}`, 
            // Numeric fields (if search is a number)
            ...((!isNaN(Number(search)) && search.trim() !== '') ? [
                sql `${legalDocuments.id} = ${Number(search)}`,
                sql `${legalDocuments.createdBy} = ${Number(search)}`
            ] : []))
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
            ? or(
            // Use ILIKE for case-insensitive search
            sql `${onjnReports.reportNumber} ILIKE ${'%' + search + '%'}`, sql `${onjnReports.reportType} ILIKE ${'%' + search + '%'}`, sql `${onjnReports.status} ILIKE ${'%' + search + '%'}`, sql `${onjnReports.description} ILIKE ${'%' + search + '%'}`, 
            // Company name search (join with companies)
            sql `EXISTS (
            SELECT 1 FROM ${companies} c 
            WHERE c.id = ${onjnReports.companyId} 
            AND c.name ILIKE ${'%' + search + '%'}
          )`, 
            // Numeric fields (if search is a number)
            ...((!isNaN(Number(search)) && search.trim() !== '') ? [
                sql `${onjnReports.id} = ${Number(search)}`,
                sql `${onjnReports.companyId} = ${Number(search)}`,
                sql `${onjnReports.id} = ${Number(search)}`
            ] : []))
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
    async updateOnjnReport(id, updateOnjnReport) {
        const { commissionDate: cd, ...updateOnjnReportClean } = updateOnjnReport;
        const [onjnReport] = await db
            .update(onjnReports)
            .set({ ...updateOnjnReportClean, updatedAt: new Date() })
            .where(eq(onjnReports.id, id))
            .returning();
        return onjnReport;
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
    async getAttachment(id) {
        const [attachment] = await db.select().from(attachments).where(eq(attachments.id, id));
        return attachment || undefined;
    }
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
