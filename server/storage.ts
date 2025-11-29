import {
  users,
  companies,
  rooms,
  customers,
  projects,
  editors,
  bookings,
  bookingRepeats,
  auditLogs,
  type User,
  type UpsertUser,
  type Company,
  type InsertCompany,
  type Room,
  type InsertRoom,
  type Customer,
  type InsertCustomer,
  type Project,
  type InsertProject,
  type Editor,
  type InsertEditor,
  type Booking,
  type InsertBooking,
  type BookingWithRelations,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, ne, or } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Company operations
  getCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;

  // Room operations
  getRooms(): Promise<Room[]>;
  getRoom(id: number): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined>;
  deleteRoom(id: number): Promise<boolean>;

  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;

  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Editor operations
  getEditors(): Promise<Editor[]>;
  getEditor(id: number): Promise<Editor | undefined>;
  createEditor(editor: InsertEditor): Promise<Editor>;
  updateEditor(id: number, editor: Partial<InsertEditor>): Promise<Editor | undefined>;
  deleteEditor(id: number): Promise<boolean>;

  // Booking operations
  getBookings(): Promise<BookingWithRelations[]>;
  getBooking(id: number): Promise<BookingWithRelations | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  cancelBooking(id: number, reason: string): Promise<Booking | undefined>;
  checkBookingConflict(roomId: number, date: string, fromTime: string, toTime: string, excludeId?: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Company operations
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [created] = await db.insert(companies).values(company).returning();
    return created;
  }

  // Room operations
  async getRooms(): Promise<Room[]> {
    return await db.select().from(rooms);
  }

  async getRoom(id: number): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const [created] = await db.insert(rooms).values(room).returning();
    return created;
  }

  async updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined> {
    const [updated] = await db.update(rooms).set(room).where(eq(rooms.id, id)).returning();
    return updated;
  }

  async deleteRoom(id: number): Promise<boolean> {
    const result = await db.delete(rooms).where(eq(rooms.id, id));
    return true;
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updated] = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return updated;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    await db.delete(customers).where(eq(customers.id, id));
    return true;
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db.update(projects).set(project).where(eq(projects.id, id)).returning();
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  }

  // Editor operations
  async getEditors(): Promise<Editor[]> {
    return await db.select().from(editors);
  }

  async getEditor(id: number): Promise<Editor | undefined> {
    const [editor] = await db.select().from(editors).where(eq(editors.id, id));
    return editor;
  }

  async createEditor(editor: InsertEditor): Promise<Editor> {
    const [created] = await db.insert(editors).values(editor).returning();
    return created;
  }

  async updateEditor(id: number, editor: Partial<InsertEditor>): Promise<Editor | undefined> {
    const [updated] = await db.update(editors).set(editor).where(eq(editors.id, id)).returning();
    return updated;
  }

  async deleteEditor(id: number): Promise<boolean> {
    await db.delete(editors).where(eq(editors.id, id));
    return true;
  }

  // Booking operations
  async getBookings(): Promise<BookingWithRelations[]> {
    const allBookings = await db.select().from(bookings);
    const allRooms = await db.select().from(rooms);
    const allCustomers = await db.select().from(customers);
    const allProjects = await db.select().from(projects);
    const allEditors = await db.select().from(editors);

    return allBookings.map((booking) => ({
      ...booking,
      room: allRooms.find((r) => r.id === booking.roomId) || null,
      customer: allCustomers.find((c) => c.id === booking.customerId) || null,
      project: allProjects.find((p) => p.id === booking.projectId) || null,
      editor: allEditors.find((e) => e.id === booking.editorId) || null,
    }));
  }

  async getBooking(id: number): Promise<BookingWithRelations | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!booking) return undefined;

    const [room] = booking.roomId ? await db.select().from(rooms).where(eq(rooms.id, booking.roomId)) : [null];
    const [customer] = booking.customerId ? await db.select().from(customers).where(eq(customers.id, booking.customerId)) : [null];
    const [project] = booking.projectId ? await db.select().from(projects).where(eq(projects.id, booking.projectId)) : [null];
    const [editor] = booking.editorId ? await db.select().from(editors).where(eq(editors.id, booking.editorId)) : [null];

    return {
      ...booking,
      room: room || null,
      customer: customer || null,
      project: project || null,
      editor: editor || null,
    };
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [created] = await db.insert(bookings).values(booking).returning();
    return created;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async cancelBooking(id: number, reason: string): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set({
        isCancelled: true,
        cancelReason: reason,
        status: "Cancelled",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async checkBookingConflict(
    roomId: number,
    date: string,
    fromTime: string,
    toTime: string,
    excludeId?: number
  ): Promise<boolean> {
    // Check if room allows ignoring conflicts
    const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
    if (room?.ignoreConflict) {
      return false;
    }

    // Build query conditions
    let conditions = and(
      eq(bookings.roomId, roomId),
      eq(bookings.date, date),
      eq(bookings.isCancelled, false),
      or(
        // New booking starts during an existing booking
        and(
          lte(bookings.bookingFromTime, fromTime),
          gte(bookings.bookingToTime, fromTime)
        ),
        // New booking ends during an existing booking
        and(
          lte(bookings.bookingFromTime, toTime),
          gte(bookings.bookingToTime, toTime)
        ),
        // New booking encompasses an existing booking
        and(
          gte(bookings.bookingFromTime, fromTime),
          lte(bookings.bookingToTime, toTime)
        )
      )
    );

    const conflicting = await db
      .select()
      .from(bookings)
      .where(conditions);

    // Filter out the current booking if updating
    const filtered = excludeId
      ? conflicting.filter((b) => b.id !== excludeId)
      : conflicting;

    return filtered.length > 0;
  }
}

export const storage = new DatabaseStorage();
