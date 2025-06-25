import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  role: varchar("role", { length: 50 }).notNull().default("operator"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  registrationNumber: varchar("registration_number", { length: 100 }),
  taxId: varchar("tax_id", { length: 100 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Locations table
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  managerId: integer("manager_id").references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Providers table
export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  website: varchar("website", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cabinets table
export const cabinets = pgTable("cabinets", {
  id: serial("id").primaryKey(),
  serialNumber: varchar("serial_number", { length: 100 }).notNull().unique(),
  model: varchar("model", { length: 255 }).notNull(),
  manufacturer: varchar("manufacturer", { length: 255 }),
  providerId: integer("provider_id").references(() => providers.id),
  locationId: integer("location_id").references(() => locations.id),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  installationDate: timestamp("installation_date"),
  lastMaintenanceDate: timestamp("last_maintenance_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  dailyRevenue: decimal("daily_revenue", { precision: 10, scale: 2 }),
  specifications: jsonb("specifications"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Game Mixes table
export const gameMixes = pgTable("game_mixes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  providerId: integer("provider_id").references(() => providers.id),
  gameCount: integer("game_count").notNull().default(0),
  configuration: jsonb("configuration"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Slots table
export const slots = pgTable("slots", {
  id: serial("id").primaryKey(),
  cabinetId: integer("cabinet_id").references(() => cabinets.id),
  gameMixId: integer("game_mix_id").references(() => gameMixes.id),
  providerId: integer("provider_id").references(() => providers.id),
  slotNumber: integer("slot_number").notNull(),
  gameName: varchar("game_name", { length: 255 }),
  gameType: varchar("game_type", { length: 100 }),
  denomination: decimal("denomination", { precision: 8, scale: 2 }),
  maxBet: decimal("max_bet", { precision: 8, scale: 2 }),
  rtp: decimal("rtp", { precision: 5, scale: 2 }),
  propertyType: varchar("property_type", { length: 50 }).notNull().default("property"), // "property" or "rent"
  ownerId: integer("owner_id"), // References companies.id for property, providers.id for rent
  serialNr: varchar("serial_nr", { length: 100 }), // Links to invoice for contract tracking
  invoiceId: integer("invoice_id").references(() => invoices.id),
  licenseDate: timestamp("license_date"), // Links to ONJN module for license management
  onjnReportId: integer("onjn_report_id").references(() => onjnReports.id),
  dailyRevenue: decimal("daily_revenue", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull().unique(),
  companyId: integer("company_id").references(() => companies.id),
  locationId: integer("location_id").references(() => locations.id),
  invoiceDate: timestamp("invoice_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  paidDate: timestamp("paid_date"),
  serialNumbers: text("serial_numbers"), // Space-separated serial numbers
  licenseDate: timestamp("license_date"), // Date for ONJN license connection
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Rent Agreements table
export const rentAgreements = pgTable("rent_agreements", {
  id: serial("id").primaryKey(),
  agreementNumber: varchar("agreement_number", { length: 100 }).notNull().unique(),
  companyId: integer("company_id").references(() => companies.id),
  locationId: integer("location_id").references(() => locations.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  monthlyRent: decimal("monthly_rent", { precision: 10, scale: 2 }).notNull(),
  securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }),
  terms: text("terms"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Legal Documents table
export const legalDocuments = pgTable("legal_documents", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  documentType: varchar("document_type", { length: 100 }).notNull(),
  companyId: integer("company_id").references(() => companies.id),
  locationId: integer("location_id").references(() => locations.id),
  issueDate: timestamp("issue_date"),
  expiryDate: timestamp("expiry_date"),
  issuingAuthority: varchar("issuing_authority", { length: 255 }),
  documentNumber: varchar("document_number", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  filePath: varchar("file_path", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ONJN Reports table
export const onjnReports = pgTable("onjn_reports", {
  id: serial("id").primaryKey(),
  reportType: varchar("report_type", { length: 100 }).notNull(),
  reportPeriod: varchar("report_period", { length: 100 }).notNull(),
  companyId: integer("company_id").references(() => companies.id),
  locationId: integer("location_id").references(() => locations.id),
  submissionDate: timestamp("submission_date"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  serialNumber: varchar("serial_number", { length: 100 }), // Connection to Invoice serial numbers
  licenseDate: timestamp("license_date"), // Connection to Invoice license date
  reportData: jsonb("report_data"),
  filePath: varchar("file_path", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity Logs table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: integer("entity_id").notNull(),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  managedLocations: many(locations),
  activityLogs: many(activityLogs),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  locations: many(locations),
  invoices: many(invoices),
  rentAgreements: many(rentAgreements),
  legalDocuments: many(legalDocuments),
  onjnReports: many(onjnReports),
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
  company: one(companies, {
    fields: [locations.companyId],
    references: [companies.id],
  }),
  manager: one(users, {
    fields: [locations.managerId],
    references: [users.id],
  }),
  cabinets: many(cabinets),
  invoices: many(invoices),
  rentAgreements: many(rentAgreements),
  legalDocuments: many(legalDocuments),
  onjnReports: many(onjnReports),
}));

export const providersRelations = relations(providers, ({ many }) => ({
  cabinets: many(cabinets),
  gameMixes: many(gameMixes),
}));

export const cabinetsRelations = relations(cabinets, ({ one, many }) => ({
  provider: one(providers, {
    fields: [cabinets.providerId],
    references: [providers.id],
  }),
  location: one(locations, {
    fields: [cabinets.locationId],
    references: [locations.id],
  }),
  slots: many(slots),
}));

export const gameMixesRelations = relations(gameMixes, ({ one, many }) => ({
  provider: one(providers, {
    fields: [gameMixes.providerId],
    references: [providers.id],
  }),
  slots: many(slots),
}));

export const slotsRelations = relations(slots, ({ one }) => ({
  cabinet: one(cabinets, {
    fields: [slots.cabinetId],
    references: [cabinets.id],
  }),
  gameMix: one(gameMixes, {
    fields: [slots.gameMixId],
    references: [gameMixes.id],
  }),
  provider: one(providers, {
    fields: [slots.providerId],
    references: [providers.id],
  }),
  invoice: one(invoices, {
    fields: [slots.invoiceId],
    references: [invoices.id],
  }),
  onjnReport: one(onjnReports, {
    fields: [slots.onjnReportId],
    references: [onjnReports.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  company: one(companies, {
    fields: [invoices.companyId],
    references: [companies.id],
  }),
  location: one(locations, {
    fields: [invoices.locationId],
    references: [locations.id],
  }),
  slots: many(slots),
}));

export const rentAgreementsRelations = relations(rentAgreements, ({ one }) => ({
  company: one(companies, {
    fields: [rentAgreements.companyId],
    references: [companies.id],
  }),
  location: one(locations, {
    fields: [rentAgreements.locationId],
    references: [locations.id],
  }),
}));

export const legalDocumentsRelations = relations(legalDocuments, ({ one }) => ({
  company: one(companies, {
    fields: [legalDocuments.companyId],
    references: [companies.id],
  }),
  location: one(locations, {
    fields: [legalDocuments.locationId],
    references: [locations.id],
  }),
}));

export const onjnReportsRelations = relations(onjnReports, ({ one, many }) => ({
  company: one(companies, {
    fields: [onjnReports.companyId],
    references: [companies.id],
  }),
  location: one(locations, {
    fields: [onjnReports.locationId],
    references: [locations.id],
  }),
  slots: many(slots),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
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

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProviderSchema = createInsertSchema(providers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  logoUrl: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
});

export const insertCabinetSchema = createInsertSchema(cabinets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGameMixSchema = createInsertSchema(gameMixes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSlotSchema = createInsertSchema(slots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRentAgreementSchema = createInsertSchema(rentAgreements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLegalDocumentSchema = createInsertSchema(legalDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOnjnReportSchema = createInsertSchema(onjnReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;

export type Cabinet = typeof cabinets.$inferSelect;
export type InsertCabinet = z.infer<typeof insertCabinetSchema>;

export type GameMix = typeof gameMixes.$inferSelect;
export type InsertGameMix = z.infer<typeof insertGameMixSchema>;

export type Slot = typeof slots.$inferSelect;
export type InsertSlot = z.infer<typeof insertSlotSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type RentAgreement = typeof rentAgreements.$inferSelect;
export type InsertRentAgreement = z.infer<typeof insertRentAgreementSchema>;

export type LegalDocument = typeof legalDocuments.$inferSelect;
export type InsertLegalDocument = z.infer<typeof insertLegalDocumentSchema>;

export type OnjnReport = typeof onjnReports.$inferSelect;
export type InsertOnjnReport = z.infer<typeof insertOnjnReportSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// File attachments table
export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // 'company', 'location', 'user', etc.
  entityId: integer("entity_id").notNull(),
  uploadedBy: integer("uploaded_by").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  uploader: one(users, {
    fields: [attachments.uploadedBy],
    references: [users.id],
  }),
}));

export const insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  createdAt: true,
});

export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;
