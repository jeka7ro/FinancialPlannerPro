import { pgTable, serial, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
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
export const insertAttachmentSchema = createInsertSchema(attachments).omit({
    id: true,
    createdAt: true,
});
