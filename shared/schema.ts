import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  telephone: varchar("telephone", { length: 50 }),
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

// User Locations - Junction table for user location assignments
export const userLocations = pgTable("user_locations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  locationId: integer("location_id").notNull().references(() => locations.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserLocation: primaryKey({ columns: [table.userId, table.locationId] })
}));

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
  serialNumber: varchar("serial_number", { length: 100 }),
  model: varchar("model", { length: 255 }).notNull(),
  manufacturer: varchar("manufacturer", { length: 255 }),
  providerId: integer("provider_id").references(() => providers.id),
  locationId: integer("location_id").references(() => locations.id),
  status: varchar("status", { length: 50 }).notNull().default("active"),
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
  exciterType: varchar("exciter_type", { length: 100 }),
  denomination: decimal("denomination", { precision: 8, scale: 2 }),
  maxBet: decimal("max_bet", { precision: 8, scale: 2 }),
  rtp: decimal("rtp", { precision: 5, scale: 2 }),
  propertyType: varchar("property_type", { length: 50 }).notNull().default("property"), // "property" or "rent"
  ownerId: integer("owner_id"), // References companies.id for property, providers.id for rent
  serialNr: varchar("serial_nr", { length: 100 }), // Links to invoice for contract tracking
  invoiceId: integer("invoice_id").references(() => invoices.id),
  commissionDate: timestamp("commission_date"), // Commission date - editable field, auto-filled from ONJN if available
  onjnReportId: integer("onjn_report_id").references(() => onjnReports.id),
  dailyRevenue: decimal("daily_revenue", { precision: 10, scale: 2 }),
  year: integer("year"), // Year of manufacture
  gamingPlaces: integer("gaming_places"), // Number of gaming places
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
  amortizationMonths: integer("amortization_months"), // Number of months for amortization
  propertyType: varchar("property_type", { length: 50 }).default("property"), // property or rent
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

// ONJN Reports table - License Commission
export const onjnReports = pgTable("onjn_reports", {
  id: serial("id").primaryKey(),
  commissionType: varchar("commission_type", { length: 100 }).notNull().default("license_commission"),
  commissionDate: timestamp("commission_date").notNull(),
  serialNumbers: text("serial_numbers"), // Multiple serial numbers separated by spaces, like invoices
  companyId: integer("company_id").references(() => companies.id),
  locationId: integer("location_id").references(() => locations.id),
  submissionDate: timestamp("submission_date"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  notes: text("notes"),
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
  userLocations: many(userLocations),
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
  userLocations: many(userLocations),
}));

export const userLocationsRelations = relations(userLocations, ({ one }) => ({
  user: one(users, {
    fields: [userLocations.userId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [userLocations.locationId],
    references: [locations.id],
  }),
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
  website: z.string().optional().or(z.literal("")),
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
}).extend({
  invoiceDate: z.union([z.date(), z.string().transform((str) => new Date(str))]),
  dueDate: z.union([z.date(), z.string().transform((str) => new Date(str))]),
  licenseDate: z.union([z.date(), z.string().transform((str) => new Date(str)), z.undefined()]).optional(),
  paidDate: z.union([z.date(), z.string().transform((str) => new Date(str)), z.undefined()]).optional(),
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
}).extend({
  commissionDate: z.union([z.date(), z.string().transform((str) => new Date(str))]),
  submissionDate: z.union([z.date(), z.string().transform((str) => new Date(str)), z.undefined()]).optional(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export const insertUserLocationSchema = createInsertSchema(userLocations).omit({
  id: true,
  createdAt: true,
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

export type UserLocation = typeof userLocations.$inferSelect;
export type InsertUserLocation = z.infer<typeof insertUserLocationSchema>;

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

// Billing Plans table - defines different billing structures
export const billingPlans = pgTable("billing_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Standard Rent", "Revenue Share", "Hybrid"
  planType: varchar("plan_type", { length: 50 }).notNull(), // 'fixed_rent', 'revenue_share', 'hybrid'
  description: text("description"),
  baseRentAmount: decimal("base_rent_amount", { precision: 10, scale: 2 }).default("0.00"), // Fixed monthly rent
  revenueSharePercent: decimal("revenue_share_percent", { precision: 5, scale: 2 }).default("0.00"), // Percentage of revenue
  minimumGuarantee: decimal("minimum_guarantee", { precision: 10, scale: 2 }).default("0.00"), // Minimum monthly payment
  billingFrequency: varchar("billing_frequency", { length: 20 }).notNull().default("monthly"), // 'weekly', 'monthly', 'quarterly'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Location Billing - links locations to billing plans
export const locationBilling = pgTable("location_billing", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull().references(() => locations.id),
  billingPlanId: integer("billing_plan_id").notNull().references(() => billingPlans.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"), // null means ongoing
  customRentAmount: decimal("custom_rent_amount", { precision: 10, scale: 2 }), // Override plan amount if needed
  customRevenueShare: decimal("custom_revenue_share", { precision: 5, scale: 2 }), // Override plan percentage
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Revenue Reports - daily/weekly revenue data from locations
export const revenueReports = pgTable("revenue_reports", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull().references(() => locations.id),
  reportDate: timestamp("report_date").notNull(),
  reportPeriod: varchar("report_period", { length: 20 }).notNull().default("daily"), // 'daily', 'weekly', 'monthly'
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).notNull().default("0.00"),
  netRevenue: decimal("net_revenue", { precision: 12, scale: 2 }).notNull().default("0.00"), // After taxes/fees
  cabinetCount: integer("cabinet_count").notNull().default(0),
  slotCount: integer("slot_count").notNull().default(0),
  notes: text("notes"),
  reportedBy: integer("reported_by").references(() => users.id),
  verifiedBy: integer("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Automated Bills - generated bills based on billing rules
export const automatedBills = pgTable("automated_bills", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull().references(() => locations.id),
  locationBillingId: integer("location_billing_id").notNull().references(() => locationBilling.id),
  billNumber: varchar("bill_number", { length: 100 }).notNull().unique(),
  billingPeriodStart: timestamp("billing_period_start").notNull(),
  billingPeriodEnd: timestamp("billing_period_end").notNull(),
  dueDate: timestamp("due_date").notNull(),
  
  // Calculation components
  baseRentAmount: decimal("base_rent_amount", { precision: 10, scale: 2 }).default("0.00"),
  revenueShareAmount: decimal("revenue_share_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0.00"),
  revenueSharePercent: decimal("revenue_share_percent", { precision: 5, scale: 2 }).default("0.00"),
  
  // Final amounts
  subtotalAmount: decimal("subtotal_amount", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  
  // Payment tracking
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'paid', 'overdue', 'cancelled'
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0.00"),
  paidDate: timestamp("paid_date"),
  paymentMethod: varchar("payment_method", { length: 100 }),
  paymentReference: varchar("payment_reference", { length: 255 }),
  
  notes: text("notes"),
  generatedBy: integer("generated_by").references(() => users.id), // System user for automated generation
  processedBy: integer("processed_by").references(() => users.id),
  isAutomated: boolean("is_automated").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Billing Schedules - defines when bills should be generated
export const billingSchedules = pgTable("billing_schedules", {
  id: serial("id").primaryKey(),
  locationBillingId: integer("location_billing_id").notNull().references(() => locationBilling.id),
  scheduleType: varchar("schedule_type", { length: 50 }).notNull(), // 'monthly', 'weekly', 'quarterly'
  dayOfMonth: integer("day_of_month"), // For monthly billing (1-31)
  dayOfWeek: integer("day_of_week"), // For weekly billing (0-6, Sunday=0)
  lastGeneratedDate: timestamp("last_generated_date"),
  nextGenerationDate: timestamp("next_generation_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment History - tracks all payments made
export const paymentHistory = pgTable("payment_history", {
  id: serial("id").primaryKey(),
  automatedBillId: integer("automated_bill_id").notNull().references(() => automatedBills.id),
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethod: varchar("payment_method", { length: 100 }).notNull(), // 'cash', 'bank_transfer', 'card', 'other'
  paymentReference: varchar("payment_reference", { length: 255 }),
  notes: text("notes"),
  recordedBy: integer("recorded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for billing system
export const billingPlansRelations = relations(billingPlans, ({ many }) => ({
  locationBillings: many(locationBilling),
}));

export const locationBillingRelations = relations(locationBilling, ({ one, many }) => ({
  location: one(locations, {
    fields: [locationBilling.locationId],
    references: [locations.id],
  }),
  billingPlan: one(billingPlans, {
    fields: [locationBilling.billingPlanId],
    references: [billingPlans.id],
  }),
  automatedBills: many(automatedBills),
  billingSchedules: many(billingSchedules),
}));

export const revenueReportsRelations = relations(revenueReports, ({ one }) => ({
  location: one(locations, {
    fields: [revenueReports.locationId],
    references: [locations.id],
  }),
  reporter: one(users, {
    fields: [revenueReports.reportedBy],
    references: [users.id],
  }),
  verifier: one(users, {
    fields: [revenueReports.verifiedBy],
    references: [users.id],
  }),
}));

export const automatedBillsRelations = relations(automatedBills, ({ one, many }) => ({
  location: one(locations, {
    fields: [automatedBills.locationId],
    references: [locations.id],
  }),
  locationBilling: one(locationBilling, {
    fields: [automatedBills.locationBillingId],
    references: [locationBilling.id],
  }),
  generator: one(users, {
    fields: [automatedBills.generatedBy],
    references: [users.id],
  }),
  processor: one(users, {
    fields: [automatedBills.processedBy],
    references: [users.id],
  }),
  payments: many(paymentHistory),
}));

export const billingSchedulesRelations = relations(billingSchedules, ({ one }) => ({
  locationBilling: one(locationBilling, {
    fields: [billingSchedules.locationBillingId],
    references: [locationBilling.id],
  }),
}));

export const paymentHistoryRelations = relations(paymentHistory, ({ one }) => ({
  automatedBill: one(automatedBills, {
    fields: [paymentHistory.automatedBillId],
    references: [automatedBills.id],
  }),
  recordedByUser: one(users, {
    fields: [paymentHistory.recordedBy],
    references: [users.id],
  }),
}));

// Insert schemas for billing system
export const insertBillingPlanSchema = createInsertSchema(billingPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLocationBillingSchema = createInsertSchema(locationBilling).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRevenueReportSchema = createInsertSchema(revenueReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAutomatedBillSchema = createInsertSchema(automatedBills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBillingScheduleSchema = createInsertSchema(billingSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentHistorySchema = createInsertSchema(paymentHistory).omit({
  id: true,
  createdAt: true,
});

// Types for billing system
export type BillingPlan = typeof billingPlans.$inferSelect;
export type InsertBillingPlan = z.infer<typeof insertBillingPlanSchema>;

export type LocationBilling = typeof locationBilling.$inferSelect;
export type InsertLocationBilling = z.infer<typeof insertLocationBillingSchema>;

export type RevenueReport = typeof revenueReports.$inferSelect;
export type InsertRevenueReport = z.infer<typeof insertRevenueReportSchema>;

export type AutomatedBill = typeof automatedBills.$inferSelect;
export type InsertAutomatedBill = z.infer<typeof insertAutomatedBillSchema>;

export type BillingSchedule = typeof billingSchedules.$inferSelect;
export type InsertBillingSchedule = z.infer<typeof insertBillingScheduleSchema>;

export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type InsertPaymentHistory = z.infer<typeof insertPaymentHistorySchema>;
