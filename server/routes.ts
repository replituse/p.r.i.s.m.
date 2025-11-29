import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertRoomSchema,
  insertCustomerSchema,
  insertProjectSchema,
  insertEditorSchema,
  insertBookingSchema,
} from "@shared/schema";
import { addDays, differenceInDays, format, parseISO, isWeekend } from "date-fns";

export async function registerRoutes(server: Server, app: Express): Promise<void> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Room routes
  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  app.post("/api/rooms", isAuthenticated, async (req, res) => {
    try {
      const data = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(data);
      res.status(201).json(room);
    } catch (error: any) {
      console.error("Error creating room:", error);
      res.status(400).json({ message: error.message || "Failed to create room" });
    }
  });

  app.put("/api/rooms/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertRoomSchema.partial().parse(req.body);
      const room = await storage.updateRoom(id, data);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error: any) {
      console.error("Error updating room:", error);
      res.status(400).json({ message: error.message || "Failed to update room" });
    }
  });

  app.delete("/api/rooms/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRoom(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting room:", error);
      res.status(400).json({ message: error.message || "Failed to delete room" });
    }
  });

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const data = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(data);
      res.status(201).json(customer);
    } catch (error: any) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: error.message || "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, data);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error: any) {
      console.error("Error updating customer:", error);
      res.status(400).json({ message: error.message || "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomer(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      res.status(400).json({ message: error.message || "Failed to delete customer" });
    }
  });

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(data);
      res.status(201).json(project);
    } catch (error: any) {
      console.error("Error creating project:", error);
      res.status(400).json({ message: error.message || "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, data);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      console.error("Error updating project:", error);
      res.status(400).json({ message: error.message || "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting project:", error);
      res.status(400).json({ message: error.message || "Failed to delete project" });
    }
  });

  // Editor routes
  app.get("/api/editors", async (req, res) => {
    try {
      const editors = await storage.getEditors();
      res.json(editors);
    } catch (error) {
      console.error("Error fetching editors:", error);
      res.status(500).json({ message: "Failed to fetch editors" });
    }
  });

  app.post("/api/editors", isAuthenticated, async (req, res) => {
    try {
      const data = insertEditorSchema.parse(req.body);
      const editor = await storage.createEditor(data);
      res.status(201).json(editor);
    } catch (error: any) {
      console.error("Error creating editor:", error);
      res.status(400).json({ message: error.message || "Failed to create editor" });
    }
  });

  app.put("/api/editors/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertEditorSchema.partial().parse(req.body);
      const editor = await storage.updateEditor(id, data);
      if (!editor) {
        return res.status(404).json({ message: "Editor not found" });
      }
      res.json(editor);
    } catch (error: any) {
      console.error("Error updating editor:", error);
      res.status(400).json({ message: error.message || "Failed to update editor" });
    }
  });

  app.delete("/api/editors/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEditor(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting editor:", error);
      res.status(400).json({ message: error.message || "Failed to delete editor" });
    }
  });

  // Booking routes
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.post("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const { ignoreConflict, ...bookingData } = req.body;
      
      // Check for conflicts unless ignoreConflict is true
      if (!ignoreConflict && bookingData.roomId && bookingData.date && bookingData.bookingFromTime && bookingData.bookingToTime) {
        const hasConflict = await storage.checkBookingConflict(
          bookingData.roomId,
          bookingData.date,
          bookingData.bookingFromTime,
          bookingData.bookingToTime
        );
        
        if (hasConflict) {
          return res.status(409).json({ message: "Booking conflict detected for this room and time" });
        }
      }

      const data = insertBookingSchema.parse(bookingData);
      const booking = await storage.createBooking(data);
      res.status(201).json(booking);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      res.status(400).json({ message: error.message || "Failed to create booking" });
    }
  });

  app.put("/api/bookings/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { ignoreConflict, ...bookingData } = req.body;

      // Check for conflicts unless ignoreConflict is true
      if (!ignoreConflict && bookingData.roomId && bookingData.date && bookingData.bookingFromTime && bookingData.bookingToTime) {
        const hasConflict = await storage.checkBookingConflict(
          bookingData.roomId,
          bookingData.date,
          bookingData.bookingFromTime,
          bookingData.bookingToTime,
          id
        );
        
        if (hasConflict) {
          return res.status(409).json({ message: "Booking conflict detected for this room and time" });
        }
      }

      const data = insertBookingSchema.partial().parse(bookingData);
      const booking = await storage.updateBooking(id, data);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error: any) {
      console.error("Error updating booking:", error);
      res.status(400).json({ message: error.message || "Failed to update booking" });
    }
  });

  app.put("/api/bookings/:id/cancel", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { cancelReason } = req.body;
      const booking = await storage.cancelBooking(id, cancelReason || "");
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      res.status(400).json({ message: error.message || "Failed to cancel booking" });
    }
  });

  // Repeat booking route
  app.post("/api/bookings/:id/repeat", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { fromDate, toDate, repeatPattern } = req.body;

      // Get original booking
      const originalBooking = await storage.getBooking(id);
      if (!originalBooking) {
        return res.status(404).json({ message: "Original booking not found" });
      }

      const startDate = parseISO(fromDate);
      const endDate = parseISO(toDate);
      const daysDiff = differenceInDays(endDate, startDate);

      if (daysDiff < 0) {
        return res.status(400).json({ message: "End date must be after start date" });
      }

      const createdBookings: any[] = [];

      for (let i = 0; i <= daysDiff; i++) {
        const currentDate = addDays(startDate, i);
        
        // Skip weekends if pattern is weekdays
        if (repeatPattern === "weekdays" && isWeekend(currentDate)) {
          continue;
        }
        
        // Skip non-weekly days if pattern is weekly
        if (repeatPattern === "weekly" && i % 7 !== 0) {
          continue;
        }

        const dateStr = format(currentDate, "yyyy-MM-dd");

        // Check for conflicts
        const hasConflict = await storage.checkBookingConflict(
          originalBooking.roomId,
          dateStr,
          originalBooking.bookingFromTime,
          originalBooking.bookingToTime
        );

        if (!hasConflict) {
          const newBooking = await storage.createBooking({
            date: dateStr,
            bookingFromTime: originalBooking.bookingFromTime,
            bookingToTime: originalBooking.bookingToTime,
            actualFromTime: originalBooking.actualFromTime,
            actualToTime: originalBooking.actualToTime,
            breakMinutes: originalBooking.breakMinutes,
            customerId: originalBooking.customerId,
            projectId: originalBooking.projectId,
            roomId: originalBooking.roomId,
            editorId: originalBooking.editorId,
            contactPerson: originalBooking.contactPerson,
            status: originalBooking.status,
            remarks: originalBooking.remarks,
          });
          createdBookings.push(newBooking);
        }
      }

      res.status(201).json({
        message: `Created ${createdBookings.length} repeat bookings`,
        count: createdBookings.length,
        bookings: createdBookings,
      });
    } catch (error: any) {
      console.error("Error creating repeat bookings:", error);
      res.status(400).json({ message: error.message || "Failed to create repeat bookings" });
    }
  });
}
