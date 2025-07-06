"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationBillingRelations = exports.billingPlansRelations = exports.paymentHistory = exports.billingSchedules = exports.automatedBills = exports.revenueReports = exports.locationBilling = exports.billingPlans = exports.insertAttachmentSchema = exports.attachmentsRelations = exports.attachments = exports.insertUserLocationSchema = exports.insertActivityLogSchema = exports.insertOnjnReportSchema = exports.insertLegalDocumentSchema = exports.insertRentAgreementSchema = exports.insertInvoiceSchema = exports.insertSlotSchema = exports.insertGameMixSchema = exports.insertCabinetSchema = exports.insertProviderSchema = exports.insertLocationSchema = exports.insertCompanySchema = exports.insertUserSchema = exports.activityLogsRelations = exports.onjnReportsRelations = exports.legalDocumentsRelations = exports.rentAgreementsRelations = exports.invoicesRelations = exports.slotsRelations = exports.gameMixesRelations = exports.cabinetsRelations = exports.providersRelations = exports.userLocationsRelations = exports.locationsRelations = exports.companiesRelations = exports.usersRelations = exports.activityLogs = exports.onjnReports = exports.legalDocuments = exports.rentAgreements = exports.invoices = exports.slots = exports.gameMixes = exports.cabinets = exports.providers = exports.userLocations = exports.locations = exports.companies = exports.users = void 0;
exports.insertPaymentHistorySchema = exports.insertBillingScheduleSchema = exports.insertAutomatedBillSchema = exports.insertRevenueReportSchema = exports.insertLocationBillingSchema = exports.insertBillingPlanSchema = exports.paymentHistoryRelations = exports.billingSchedulesRelations = exports.automatedBillsRelations = exports.revenueReportsRelations = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// Users table
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.varchar)("username", { length: 255 }).notNull().unique(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    telephone: (0, pg_core_1.varchar)("telephone", { length: 50 }),
    password: (0, pg_core_1.text)("password").notNull(),
    firstName: (0, pg_core_1.varchar)("first_name", { length: 255 }),
    lastName: (0, pg_core_1.varchar)("last_name", { length: 255 }),
    role: (0, pg_core_1.varchar)("role", { length: 50 }).notNull().default("operator"),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Companies table
exports.companies = (0, pg_core_1.pgTable)("companies", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    registrationNumber: (0, pg_core_1.varchar)("registration_number", { length: 100 }),
    taxId: (0, pg_core_1.varchar)("tax_id", { length: 100 }),
    address: (0, pg_core_1.text)("address"),
    city: (0, pg_core_1.varchar)("city", { length: 100 }),
    country: (0, pg_core_1.varchar)("country", { length: 100 }),
    phone: (0, pg_core_1.varchar)("phone", { length: 50 }),
    email: (0, pg_core_1.varchar)("email", { length: 255 }),
    website: (0, pg_core_1.varchar)("website", { length: 255 }),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Locations table
exports.locations = (0, pg_core_1.pgTable)("locations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    companyId: (0, pg_core_1.integer)("company_id").references(() => exports.companies.id),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    address: (0, pg_core_1.text)("address").notNull(),
    city: (0, pg_core_1.varchar)("city", { length: 100 }).notNull(),
    county: (0, pg_core_1.varchar)("county", { length: 100 }),
    country: (0, pg_core_1.varchar)("country", { length: 100 }).notNull(),
    phone: (0, pg_core_1.varchar)("phone", { length: 50 }),
    email: (0, pg_core_1.varchar)("email", { length: 255 }),
    managerId: (0, pg_core_1.integer)("manager_id").references(() => exports.users.id),
    latitude: (0, pg_core_1.decimal)("latitude", { precision: 10, scale: 8 }),
    longitude: (0, pg_core_1.decimal)("longitude", { precision: 11, scale: 8 }),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// User Locations - Junction table for user location assignments
exports.userLocations = (0, pg_core_1.pgTable)("user_locations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    locationId: (0, pg_core_1.integer)("location_id").notNull().references(() => exports.locations.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Providers table
exports.providers = (0, pg_core_1.pgTable)("providers", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    companyName: (0, pg_core_1.varchar)("company_name", { length: 255 }),
    contactPerson: (0, pg_core_1.varchar)("contact_person", { length: 255 }),
    email: (0, pg_core_1.varchar)("email", { length: 255 }),
    phone: (0, pg_core_1.varchar)("phone", { length: 50 }),
    address: (0, pg_core_1.text)("address"),
    city: (0, pg_core_1.varchar)("city", { length: 100 }),
    country: (0, pg_core_1.varchar)("country", { length: 100 }),
    website: (0, pg_core_1.varchar)("website", { length: 255 }),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Cabinets table
exports.cabinets = (0, pg_core_1.pgTable)("cabinets", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    serialNumber: (0, pg_core_1.varchar)("serial_number", { length: 100 }),
    model: (0, pg_core_1.varchar)("model", { length: 255 }).notNull(),
    manufacturer: (0, pg_core_1.varchar)("manufacturer", { length: 255 }),
    providerId: (0, pg_core_1.integer)("provider_id").references(() => exports.providers.id),
    locationId: (0, pg_core_1.integer)("location_id").references(() => exports.locations.id),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).notNull().default("active"),
    webLink: (0, pg_core_1.varchar)("web_link", { length: 500 }),
    lastMaintenanceDate: (0, pg_core_1.timestamp)("last_maintenance_date"),
    nextMaintenanceDate: (0, pg_core_1.timestamp)("next_maintenance_date"),
    dailyRevenue: (0, pg_core_1.decimal)("daily_revenue", { precision: 10, scale: 2 }),
    specifications: (0, pg_core_1.jsonb)("specifications"),
    technicalInfo: (0, pg_core_1.text)("technical_info"),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Game Mixes table
exports.gameMixes = (0, pg_core_1.pgTable)("game_mixes", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    providerId: (0, pg_core_1.integer)("provider_id").references(() => exports.providers.id),
    games: (0, pg_core_1.text)("games"), // Space-separated list of games in this mix
    gameCount: (0, pg_core_1.integer)("game_count").notNull().default(0),
    webLink: (0, pg_core_1.varchar)("web_link", { length: 500 }), // URL for the game mix
    configuration: (0, pg_core_1.jsonb)("configuration"),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Slots table
exports.slots = (0, pg_core_1.pgTable)("slots", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    cabinetId: (0, pg_core_1.integer)("cabinet_id").references(() => exports.cabinets.id),
    gameMixId: (0, pg_core_1.integer)("game_mix_id").references(() => exports.gameMixes.id),
    providerId: (0, pg_core_1.integer)("provider_id").references(() => exports.providers.id),
    locationId: (0, pg_core_1.integer)("location_id").references(() => exports.locations.id),
    exciterType: (0, pg_core_1.varchar)("exciter_type", { length: 100 }),
    denomination: (0, pg_core_1.decimal)("denomination", { precision: 8, scale: 2 }),
    maxBet: (0, pg_core_1.decimal)("max_bet", { precision: 8, scale: 2 }),
    rtp: (0, pg_core_1.decimal)("rtp", { precision: 5, scale: 2 }),
    propertyType: (0, pg_core_1.varchar)("property_type", { length: 50 }).notNull().default("property"), // "property" or "rent"
    ownerId: (0, pg_core_1.integer)("owner_id"), // References companies.id for property, providers.id for rent
    serialNr: (0, pg_core_1.varchar)("serial_nr", { length: 100 }), // Links to invoice for contract tracking
    invoiceId: (0, pg_core_1.integer)("invoice_id").references(() => exports.invoices.id),
    commissionDate: (0, pg_core_1.timestamp)("commission_date"), // Commission date - editable field, auto-filled from ONJN if available
    onjnReportId: (0, pg_core_1.integer)("onjn_report_id").references(() => exports.onjnReports.id),
    dailyRevenue: (0, pg_core_1.decimal)("daily_revenue", { precision: 10, scale: 2 }),
    year: (0, pg_core_1.integer)("year"), // Year of manufacture
    gamingPlaces: (0, pg_core_1.integer)("gaming_places"), // Number of gaming places
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Invoices table
exports.invoices = (0, pg_core_1.pgTable)("invoices", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    invoiceNumber: (0, pg_core_1.varchar)("invoice_number", { length: 100 }).notNull().unique(),
    companyId: (0, pg_core_1.integer)("company_id").references(() => exports.companies.id),
    sellerCompanyId: (0, pg_core_1.integer)("seller_company_id").references(() => exports.companies.id),
    locationIds: (0, pg_core_1.text)("location_ids"), // Multiple location IDs separated by commas
    invoiceDate: (0, pg_core_1.timestamp)("invoice_date").notNull(),
    dueDate: (0, pg_core_1.timestamp)("due_date").notNull(),
    subtotal: (0, pg_core_1.decimal)("subtotal", { precision: 10, scale: 2 }).notNull(),
    taxAmount: (0, pg_core_1.decimal)("tax_amount", { precision: 10, scale: 2 }).notNull(),
    totalAmount: (0, pg_core_1.decimal)("total_amount", { precision: 10, scale: 2 }).notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).notNull().default("pending"),
    paidDate: (0, pg_core_1.timestamp)("paid_date"),
    serialNumbers: (0, pg_core_1.text)("serial_numbers"), // Space-separated serial numbers
    amortizationMonths: (0, pg_core_1.integer)("amortization_months"), // Number of months for amortization
    propertyType: (0, pg_core_1.varchar)("property_type", { length: 50 }).default("property"), // property or rent
    currency: (0, pg_core_1.varchar)("currency", { length: 3 }).default("EUR"), // LEI, USD, EUR
    notes: (0, pg_core_1.text)("notes"),
    createdBy: (0, pg_core_1.integer)("created_by").references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Rent Agreements table
exports.rentAgreements = (0, pg_core_1.pgTable)("rent_agreements", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    agreementNumber: (0, pg_core_1.varchar)("agreement_number", { length: 100 }).notNull().unique(),
    companyId: (0, pg_core_1.integer)("company_id").references(() => exports.companies.id),
    locationId: (0, pg_core_1.integer)("location_id").references(() => exports.locations.id),
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date").notNull(),
    monthlyRent: (0, pg_core_1.decimal)("monthly_rent", { precision: 10, scale: 2 }).notNull(),
    securityDeposit: (0, pg_core_1.decimal)("security_deposit", { precision: 10, scale: 2 }),
    terms: (0, pg_core_1.text)("terms"),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).notNull().default("active"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Legal Documents table
exports.legalDocuments = (0, pg_core_1.pgTable)("legal_documents", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    documentType: (0, pg_core_1.varchar)("document_type", { length: 100 }).notNull(),
    companyId: (0, pg_core_1.integer)("company_id").references(() => exports.companies.id),
    locationIds: (0, pg_core_1.text)("location_ids"), // Multiple location IDs separated by commas
    issueDate: (0, pg_core_1.timestamp)("issue_date"),
    expiryDate: (0, pg_core_1.timestamp)("expiry_date"),
    issuingAuthority: (0, pg_core_1.varchar)("issuing_authority", { length: 255 }),
    documentNumber: (0, pg_core_1.varchar)("document_number", { length: 100 }),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).notNull().default("active"),
    filePath: (0, pg_core_1.varchar)("file_path", { length: 500 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// ONJN Reports table - License Commission and Notifications
exports.onjnReports = (0, pg_core_1.pgTable)("onjn_reports", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    type: (0, pg_core_1.varchar)("type", { length: 100 }).notNull().default("license_commission"), // "license_commission" or "notification"
    // For license commissions
    commissionType: (0, pg_core_1.varchar)("commission_type", { length: 100 }),
    commissionDate: (0, pg_core_1.timestamp)("commission_date"),
    serialNumbers: (0, pg_core_1.text)("serial_numbers"), // Multiple serial numbers separated by spaces, like invoices
    // For notifications
    notificationAuthority: (0, pg_core_1.varchar)("notification_authority", { length: 50 }), // "onjn_central" or "onjn_local"
    notificationType: (0, pg_core_1.varchar)("notification_type", { length: 100 }), // Various notification types
    notificationDate: (0, pg_core_1.timestamp)("notification_date"),
    locationIds: (0, pg_core_1.text)("location_ids"), // Multiple location IDs separated by commas
    companyId: (0, pg_core_1.integer)("company_id").references(() => exports.companies.id),
    submissionDate: (0, pg_core_1.timestamp)("submission_date"),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).notNull().default("draft"),
    notes: (0, pg_core_1.text)("notes"),
    filePath: (0, pg_core_1.varchar)("file_path", { length: 500 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Activity Logs table
exports.activityLogs = (0, pg_core_1.pgTable)("activity_logs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => exports.users.id),
    action: (0, pg_core_1.varchar)("action", { length: 255 }).notNull(),
    entityType: (0, pg_core_1.varchar)("entity_type", { length: 100 }).notNull(),
    entityId: (0, pg_core_1.integer)("entity_id").notNull(),
    details: (0, pg_core_1.jsonb)("details"),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow(),
});
// Relations
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    managedLocations: many(exports.locations),
    activityLogs: many(exports.activityLogs),
    userLocations: many(exports.userLocations),
}));
exports.companiesRelations = (0, drizzle_orm_1.relations)(exports.companies, ({ many }) => ({
    locations: many(exports.locations),
    invoices: many(exports.invoices),
    rentAgreements: many(exports.rentAgreements),
    legalDocuments: many(exports.legalDocuments),
    onjnReports: many(exports.onjnReports),
}));
exports.locationsRelations = (0, drizzle_orm_1.relations)(exports.locations, ({ one, many }) => ({
    company: one(exports.companies, {
        fields: [exports.locations.companyId],
        references: [exports.companies.id],
    }),
    manager: one(exports.users, {
        fields: [exports.locations.managerId],
        references: [exports.users.id],
    }),
    cabinets: many(exports.cabinets),
    invoices: many(exports.invoices),
    rentAgreements: many(exports.rentAgreements),
    legalDocuments: many(exports.legalDocuments),
    onjnReports: many(exports.onjnReports),
    userLocations: many(exports.userLocations),
}));
exports.userLocationsRelations = (0, drizzle_orm_1.relations)(exports.userLocations, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.userLocations.userId],
        references: [exports.users.id],
    }),
    location: one(exports.locations, {
        fields: [exports.userLocations.locationId],
        references: [exports.locations.id],
    }),
}));
exports.providersRelations = (0, drizzle_orm_1.relations)(exports.providers, ({ many }) => ({
    cabinets: many(exports.cabinets),
    gameMixes: many(exports.gameMixes),
}));
exports.cabinetsRelations = (0, drizzle_orm_1.relations)(exports.cabinets, ({ one, many }) => ({
    provider: one(exports.providers, {
        fields: [exports.cabinets.providerId],
        references: [exports.providers.id],
    }),
    location: one(exports.locations, {
        fields: [exports.cabinets.locationId],
        references: [exports.locations.id],
    }),
    slots: many(exports.slots),
}));
exports.gameMixesRelations = (0, drizzle_orm_1.relations)(exports.gameMixes, ({ one, many }) => ({
    provider: one(exports.providers, {
        fields: [exports.gameMixes.providerId],
        references: [exports.providers.id],
    }),
    slots: many(exports.slots),
}));
exports.slotsRelations = (0, drizzle_orm_1.relations)(exports.slots, ({ one }) => ({
    cabinet: one(exports.cabinets, {
        fields: [exports.slots.cabinetId],
        references: [exports.cabinets.id],
    }),
    gameMix: one(exports.gameMixes, {
        fields: [exports.slots.gameMixId],
        references: [exports.gameMixes.id],
    }),
    provider: one(exports.providers, {
        fields: [exports.slots.providerId],
        references: [exports.providers.id],
    }),
    location: one(exports.locations, {
        fields: [exports.slots.locationId],
        references: [exports.locations.id],
    }),
    invoice: one(exports.invoices, {
        fields: [exports.slots.invoiceId],
        references: [exports.invoices.id],
    }),
    onjnReport: one(exports.onjnReports, {
        fields: [exports.slots.onjnReportId],
        references: [exports.onjnReports.id],
    }),
}));
exports.invoicesRelations = (0, drizzle_orm_1.relations)(exports.invoices, ({ one, many }) => ({
    company: one(exports.companies, {
        fields: [exports.invoices.companyId],
        references: [exports.companies.id],
    }),
    sellerCompany: one(exports.companies, {
        fields: [exports.invoices.sellerCompanyId],
        references: [exports.companies.id],
    }),
    createdByUser: one(exports.users, {
        fields: [exports.invoices.createdBy],
        references: [exports.users.id],
    }),
    slots: many(exports.slots),
}));
exports.rentAgreementsRelations = (0, drizzle_orm_1.relations)(exports.rentAgreements, ({ one }) => ({
    company: one(exports.companies, {
        fields: [exports.rentAgreements.companyId],
        references: [exports.companies.id],
    }),
    location: one(exports.locations, {
        fields: [exports.rentAgreements.locationId],
        references: [exports.locations.id],
    }),
}));
exports.legalDocumentsRelations = (0, drizzle_orm_1.relations)(exports.legalDocuments, ({ one }) => ({
    company: one(exports.companies, {
        fields: [exports.legalDocuments.companyId],
        references: [exports.companies.id],
    }),
}));
exports.onjnReportsRelations = (0, drizzle_orm_1.relations)(exports.onjnReports, ({ one, many }) => ({
    company: one(exports.companies, {
        fields: [exports.onjnReports.companyId],
        references: [exports.companies.id],
    }),
    slots: many(exports.slots),
}));
exports.activityLogsRelations = (0, drizzle_orm_1.relations)(exports.activityLogs, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.activityLogs.userId],
        references: [exports.users.id],
    }),
}));
// Insert schemas
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertCompanySchema = (0, drizzle_zod_1.createInsertSchema)(exports.companies).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertLocationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.locations).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertProviderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.providers).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertCabinetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cabinets).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertGameMixSchema = (0, drizzle_zod_1.createInsertSchema)(exports.gameMixes).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertSlotSchema = (0, drizzle_zod_1.createInsertSchema)(exports.slots).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertInvoiceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.invoices).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertRentAgreementSchema = (0, drizzle_zod_1.createInsertSchema)(exports.rentAgreements).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertLegalDocumentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.legalDocuments).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertOnjnReportSchema = (0, drizzle_zod_1.createInsertSchema)(exports.onjnReports).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    commissionDate: zod_1.z.string().optional(),
    notificationDate: zod_1.z.string().optional(),
    submissionDate: zod_1.z.string().optional(),
});
exports.insertActivityLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.activityLogs).omit({
    id: true,
    timestamp: true,
});
exports.insertUserLocationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userLocations).omit({
    id: true,
    createdAt: true,
});
// File attachments table
exports.attachments = (0, pg_core_1.pgTable)("attachments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    filename: (0, pg_core_1.varchar)("filename", { length: 255 }).notNull(),
    originalName: (0, pg_core_1.varchar)("original_name", { length: 255 }).notNull(),
    mimeType: (0, pg_core_1.varchar)("mime_type", { length: 100 }).notNull(),
    fileSize: (0, pg_core_1.integer)("file_size").notNull(),
    filePath: (0, pg_core_1.varchar)("file_path", { length: 500 }).notNull(),
    entityType: (0, pg_core_1.varchar)("entity_type", { length: 50 }).notNull(), // 'company', 'location', 'user', etc.
    entityId: (0, pg_core_1.integer)("entity_id").notNull(),
    uploadedBy: (0, pg_core_1.integer)("uploaded_by").notNull(),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.attachmentsRelations = (0, drizzle_orm_1.relations)(exports.attachments, ({ one }) => ({
    uploader: one(exports.users, {
        fields: [exports.attachments.uploadedBy],
        references: [exports.users.id],
    }),
}));
exports.insertAttachmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.attachments).omit({
    id: true,
    createdAt: true,
});
// Billing Plans table - defines different billing structures
exports.billingPlans = (0, pg_core_1.pgTable)("billing_plans", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(), // e.g., "Standard Rent", "Revenue Share", "Hybrid"
    planType: (0, pg_core_1.varchar)("plan_type", { length: 50 }).notNull(), // 'fixed_rent', 'revenue_share', 'hybrid'
    description: (0, pg_core_1.text)("description"),
    baseRentAmount: (0, pg_core_1.decimal)("base_rent_amount", { precision: 10, scale: 2 }).default("0.00"), // Fixed monthly rent
    revenueSharePercent: (0, pg_core_1.decimal)("revenue_share_percent", { precision: 5, scale: 2 }).default("0.00"), // Percentage of revenue
    minimumGuarantee: (0, pg_core_1.decimal)("minimum_guarantee", { precision: 10, scale: 2 }).default("0.00"), // Minimum monthly payment
    billingFrequency: (0, pg_core_1.varchar)("billing_frequency", { length: 20 }).notNull().default("monthly"), // 'weekly', 'monthly', 'quarterly'
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Location Billing - links locations to billing plans
exports.locationBilling = (0, pg_core_1.pgTable)("location_billing", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    locationId: (0, pg_core_1.integer)("location_id").notNull().references(() => exports.locations.id),
    billingPlanId: (0, pg_core_1.integer)("billing_plan_id").notNull().references(() => exports.billingPlans.id),
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date"), // null means ongoing
    customRentAmount: (0, pg_core_1.decimal)("custom_rent_amount", { precision: 10, scale: 2 }), // Override plan amount if needed
    customRevenueShare: (0, pg_core_1.decimal)("custom_revenue_share", { precision: 5, scale: 2 }), // Override plan percentage
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Revenue Reports - daily/weekly revenue data from locations
exports.revenueReports = (0, pg_core_1.pgTable)("revenue_reports", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    locationId: (0, pg_core_1.integer)("location_id").notNull().references(() => exports.locations.id),
    reportDate: (0, pg_core_1.timestamp)("report_date").notNull(),
    reportPeriod: (0, pg_core_1.varchar)("report_period", { length: 20 }).notNull().default("daily"), // 'daily', 'weekly', 'monthly'
    totalRevenue: (0, pg_core_1.decimal)("total_revenue", { precision: 12, scale: 2 }).notNull().default("0.00"),
    netRevenue: (0, pg_core_1.decimal)("net_revenue", { precision: 12, scale: 2 }).notNull().default("0.00"), // After taxes/fees
    cabinetCount: (0, pg_core_1.integer)("cabinet_count").notNull().default(0),
    slotCount: (0, pg_core_1.integer)("slot_count").notNull().default(0),
    notes: (0, pg_core_1.text)("notes"),
    reportedBy: (0, pg_core_1.integer)("reported_by").references(() => exports.users.id),
    verifiedBy: (0, pg_core_1.integer)("verified_by").references(() => exports.users.id),
    verifiedAt: (0, pg_core_1.timestamp)("verified_at"),
    isVerified: (0, pg_core_1.boolean)("is_verified").notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Automated Bills - generated bills based on billing rules
exports.automatedBills = (0, pg_core_1.pgTable)("automated_bills", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    locationId: (0, pg_core_1.integer)("location_id").notNull().references(() => exports.locations.id),
    locationBillingId: (0, pg_core_1.integer)("location_billing_id").notNull().references(() => exports.locationBilling.id),
    billNumber: (0, pg_core_1.varchar)("bill_number", { length: 100 }).notNull().unique(),
    billingPeriodStart: (0, pg_core_1.timestamp)("billing_period_start").notNull(),
    billingPeriodEnd: (0, pg_core_1.timestamp)("billing_period_end").notNull(),
    dueDate: (0, pg_core_1.timestamp)("due_date").notNull(),
    // Calculation components
    baseRentAmount: (0, pg_core_1.decimal)("base_rent_amount", { precision: 10, scale: 2 }).default("0.00"),
    revenueShareAmount: (0, pg_core_1.decimal)("revenue_share_amount", { precision: 10, scale: 2 }).default("0.00"),
    totalRevenue: (0, pg_core_1.decimal)("total_revenue", { precision: 12, scale: 2 }).default("0.00"),
    revenueSharePercent: (0, pg_core_1.decimal)("revenue_share_percent", { precision: 5, scale: 2 }).default("0.00"),
    // Final amounts
    subtotalAmount: (0, pg_core_1.decimal)("subtotal_amount", { precision: 10, scale: 2 }).notNull(),
    taxAmount: (0, pg_core_1.decimal)("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
    totalAmount: (0, pg_core_1.decimal)("total_amount", { precision: 10, scale: 2 }).notNull(),
    // Payment tracking
    status: (0, pg_core_1.varchar)("status", { length: 50 }).notNull().default("pending"), // 'pending', 'paid', 'overdue', 'cancelled'
    paidAmount: (0, pg_core_1.decimal)("paid_amount", { precision: 10, scale: 2 }).default("0.00"),
    paidDate: (0, pg_core_1.timestamp)("paid_date"),
    paymentMethod: (0, pg_core_1.varchar)("payment_method", { length: 100 }),
    paymentReference: (0, pg_core_1.varchar)("payment_reference", { length: 255 }),
    notes: (0, pg_core_1.text)("notes"),
    generatedBy: (0, pg_core_1.integer)("generated_by").references(() => exports.users.id), // System user for automated generation
    processedBy: (0, pg_core_1.integer)("processed_by").references(() => exports.users.id),
    isAutomated: (0, pg_core_1.boolean)("is_automated").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Billing Schedules - defines when bills should be generated
exports.billingSchedules = (0, pg_core_1.pgTable)("billing_schedules", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    locationBillingId: (0, pg_core_1.integer)("location_billing_id").notNull().references(() => exports.locationBilling.id),
    scheduleType: (0, pg_core_1.varchar)("schedule_type", { length: 50 }).notNull(), // 'monthly', 'weekly', 'quarterly'
    dayOfMonth: (0, pg_core_1.integer)("day_of_month"), // For monthly billing (1-31)
    dayOfWeek: (0, pg_core_1.integer)("day_of_week"), // For weekly billing (0-6, Sunday=0)
    lastGeneratedDate: (0, pg_core_1.timestamp)("last_generated_date"),
    nextGenerationDate: (0, pg_core_1.timestamp)("next_generation_date").notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Payment History - tracks all payments made
exports.paymentHistory = (0, pg_core_1.pgTable)("payment_history", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    automatedBillId: (0, pg_core_1.integer)("automated_bill_id").notNull().references(() => exports.automatedBills.id),
    paymentAmount: (0, pg_core_1.decimal)("payment_amount", { precision: 10, scale: 2 }).notNull(),
    paymentDate: (0, pg_core_1.timestamp)("payment_date").notNull(),
    paymentMethod: (0, pg_core_1.varchar)("payment_method", { length: 100 }).notNull(), // 'cash', 'bank_transfer', 'card', 'other'
    paymentReference: (0, pg_core_1.varchar)("payment_reference", { length: 255 }),
    notes: (0, pg_core_1.text)("notes"),
    recordedBy: (0, pg_core_1.integer)("recorded_by").notNull().references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Relations for billing system
exports.billingPlansRelations = (0, drizzle_orm_1.relations)(exports.billingPlans, ({ many }) => ({
    locationBillings: many(exports.locationBilling),
}));
exports.locationBillingRelations = (0, drizzle_orm_1.relations)(exports.locationBilling, ({ one, many }) => ({
    location: one(exports.locations, {
        fields: [exports.locationBilling.locationId],
        references: [exports.locations.id],
    }),
    billingPlan: one(exports.billingPlans, {
        fields: [exports.locationBilling.billingPlanId],
        references: [exports.billingPlans.id],
    }),
    automatedBills: many(exports.automatedBills),
    billingSchedules: many(exports.billingSchedules),
}));
exports.revenueReportsRelations = (0, drizzle_orm_1.relations)(exports.revenueReports, ({ one }) => ({
    location: one(exports.locations, {
        fields: [exports.revenueReports.locationId],
        references: [exports.locations.id],
    }),
    reporter: one(exports.users, {
        fields: [exports.revenueReports.reportedBy],
        references: [exports.users.id],
    }),
    verifier: one(exports.users, {
        fields: [exports.revenueReports.verifiedBy],
        references: [exports.users.id],
    }),
}));
exports.automatedBillsRelations = (0, drizzle_orm_1.relations)(exports.automatedBills, ({ one, many }) => ({
    location: one(exports.locations, {
        fields: [exports.automatedBills.locationId],
        references: [exports.locations.id],
    }),
    locationBilling: one(exports.locationBilling, {
        fields: [exports.automatedBills.locationBillingId],
        references: [exports.locationBilling.id],
    }),
    generator: one(exports.users, {
        fields: [exports.automatedBills.generatedBy],
        references: [exports.users.id],
    }),
    processor: one(exports.users, {
        fields: [exports.automatedBills.processedBy],
        references: [exports.users.id],
    }),
    payments: many(exports.paymentHistory),
}));
exports.billingSchedulesRelations = (0, drizzle_orm_1.relations)(exports.billingSchedules, ({ one }) => ({
    locationBilling: one(exports.locationBilling, {
        fields: [exports.billingSchedules.locationBillingId],
        references: [exports.locationBilling.id],
    }),
}));
exports.paymentHistoryRelations = (0, drizzle_orm_1.relations)(exports.paymentHistory, ({ one }) => ({
    automatedBill: one(exports.automatedBills, {
        fields: [exports.paymentHistory.automatedBillId],
        references: [exports.automatedBills.id],
    }),
    recordedByUser: one(exports.users, {
        fields: [exports.paymentHistory.recordedBy],
        references: [exports.users.id],
    }),
}));
// Insert schemas for billing system
exports.insertBillingPlanSchema = (0, drizzle_zod_1.createInsertSchema)(exports.billingPlans).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertLocationBillingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.locationBilling).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertRevenueReportSchema = (0, drizzle_zod_1.createInsertSchema)(exports.revenueReports).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertAutomatedBillSchema = (0, drizzle_zod_1.createInsertSchema)(exports.automatedBills).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertBillingScheduleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.billingSchedules).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertPaymentHistorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.paymentHistory).omit({
    id: true,
    createdAt: true,
});
