import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  time,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Companies table
export const companies = pgTable("companies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  shortName: varchar("short_name", { length: 50 }),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  companyId: integer("company_id").references(() => companies.id),
  role: varchar("role", { length: 50 }).default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Room types enum values
export const roomTypes = ["Sound", "Video", "Outdoor", "Editing", "VFX", "Meeting", "Other"] as const;

// Rooms/Studios table
export const rooms = pgTable("rooms", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  shortName: varchar("short_name", { length: 50 }),
  type: varchar("type", { length: 50 }).notNull(),
  ignoreConflict: boolean("ignore_conflict").default(false),
  active: boolean("active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customers table
export const customers = pgTable("customers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  description: text("description"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Editors table
export const editors = pgTable("editors", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  specialization: varchar("specialization", { length: 100 }),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Booking status enum values
export const bookingStatuses = ["Tentative", "Confirmed", "Planning", "Completed", "Cancelled"] as const;

// Bookings table
export const bookings = pgTable("bookings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  date: date("date").notNull(),
  bookingFromTime: time("booking_from_time").notNull(),
  bookingToTime: time("booking_to_time").notNull(),
  actualFromTime: time("actual_from_time"),
  actualToTime: time("actual_to_time"),
  breakMinutes: integer("break_minutes").default(0),
  customerId: integer("customer_id").references(() => customers.id),
  projectId: integer("project_id").references(() => projects.id),
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  editorId: integer("editor_id").references(() => editors.id),
  contactPerson: varchar("contact_person", { length: 255 }),
  status: varchar("status", { length: 50 }).default("Tentative"),
  remarks: text("remarks"),
  isCancelled: boolean("is_cancelled").default(false),
  cancelReason: text("cancel_reason"),
  totalBookingMinutes: integer("total_booking_minutes"),
  totalActualMinutes: integer("total_actual_minutes"),
  totalHours: varchar("total_hours", { length: 20 }),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Booking repeat table for recurring bookings
export const bookingRepeats = pgTable("booking_repeats", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  originalBookingId: integer("original_booking_id").references(() => bookings.id),
  fromDate: date("from_date").notNull(),
  toDate: date("to_date").notNull(),
  repeatPattern: varchar("repeat_pattern", { length: 50 }).default("daily"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit log table
export const auditLogs = pgTable("audit_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tableName: varchar("table_name", { length: 100 }).notNull(),
  recordId: integer("record_id"),
  action: varchar("action", { length: 50 }).notNull(),
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  customer: one(customers, {
    fields: [projects.customerId],
    references: [customers.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  customer: one(customers, {
    fields: [bookings.customerId],
    references: [customers.id],
  }),
  project: one(projects, {
    fields: [bookings.projectId],
    references: [projects.id],
  }),
  room: one(rooms, {
    fields: [bookings.roomId],
    references: [rooms.id],
  }),
  editor: one(editors, {
    fields: [bookings.editorId],
    references: [editors.id],
  }),
  createdByUser: one(users, {
    fields: [bookings.createdBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertRoomSchema = createInsertSchema(rooms).omit({ id: true, createdAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertEditorSchema = createInsertSchema(editors).omit({ id: true, createdAt: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBookingRepeatSchema = createInsertSchema(bookingRepeats).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Editor = typeof editors.$inferSelect;
export type InsertEditor = z.infer<typeof insertEditorSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type BookingRepeat = typeof bookingRepeats.$inferSelect;
export type InsertBookingRepeat = z.infer<typeof insertBookingRepeatSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// Extended booking type with relations
export type BookingWithRelations = Booking & {
  customer?: Customer | null;
  project?: Project | null;
  room?: Room | null;
  editor?: Editor | null;
};
