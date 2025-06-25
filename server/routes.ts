import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { 
  insertUserSchema, 
  insertCompanySchema, 
  insertLocationSchema,
  insertProviderSchema,
  insertCabinetSchema,
  insertGameMixSchema,
  insertSlotSchema,
  insertInvoiceSchema,
  insertRentAgreementSchema,
  insertLegalDocumentSchema,
  insertOnjnReportSchema
} from "@shared/schema";
import { ZodError } from "zod";

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "your-secret-key-here",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};

// Middleware to check if user is authenticated
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Middleware to check if user is admin
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.session?.userId || req.session?.userRole !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session(sessionConfig));

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName,
          role: user.role 
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName,
        role: user.role 
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Company routes
  app.get("/api/companies", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || "";
      
      const result = await storage.getCompanies(page, limit, search);
      res.json(result);
    } catch (error) {
      console.error("Get companies error:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.post("/api/companies", requireAuth, async (req, res) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create company error:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.get("/api/companies/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Get company error:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.put("/api/companies/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const companyData = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(id, companyData);
      res.json(company);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update company error:", error);
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  app.delete("/api/companies/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCompany(id);
      res.json({ message: "Company deleted successfully" });
    } catch (error) {
      console.error("Delete company error:", error);
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // Location routes
  app.get("/api/locations", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || "";
      
      const result = await storage.getLocations(page, limit, search);
      res.json(result);
    } catch (error) {
      console.error("Get locations error:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  app.post("/api/locations", requireAuth, async (req, res) => {
    try {
      const locationData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(locationData);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create location error:", error);
      res.status(500).json({ message: "Failed to create location" });
    }
  });

  app.get("/api/locations/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const location = await storage.getLocation(id);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      console.error("Get location error:", error);
      res.status(500).json({ message: "Failed to fetch location" });
    }
  });

  app.put("/api/locations/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const locationData = insertLocationSchema.partial().parse(req.body);
      const location = await storage.updateLocation(id, locationData);
      res.json(location);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update location error:", error);
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  app.delete("/api/locations/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLocation(id);
      res.json({ message: "Location deleted successfully" });
    } catch (error) {
      console.error("Delete location error:", error);
      res.status(500).json({ message: "Failed to delete location" });
    }
  });

  // Provider routes
  app.get("/api/providers", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || "";
      
      const result = await storage.getProviders(page, limit, search);
      res.json(result);
    } catch (error) {
      console.error("Get providers error:", error);
      res.status(500).json({ message: "Failed to fetch providers" });
    }
  });

  app.post("/api/providers", requireAuth, async (req, res) => {
    try {
      const providerData = insertProviderSchema.parse(req.body);
      const provider = await storage.createProvider(providerData);
      res.status(201).json(provider);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create provider error:", error);
      res.status(500).json({ message: "Failed to create provider" });
    }
  });

  app.get("/api/providers/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const provider = await storage.getProvider(id);
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      res.json(provider);
    } catch (error) {
      console.error("Get provider error:", error);
      res.status(500).json({ message: "Failed to fetch provider" });
    }
  });

  app.put("/api/providers/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const providerData = insertProviderSchema.partial().parse(req.body);
      const provider = await storage.updateProvider(id, providerData);
      res.json(provider);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update provider error:", error);
      res.status(500).json({ message: "Failed to update provider" });
    }
  });

  app.delete("/api/providers/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProvider(id);
      res.json({ message: "Provider deleted successfully" });
    } catch (error) {
      console.error("Delete provider error:", error);
      res.status(500).json({ message: "Failed to delete provider" });
    }
  });

  // Cabinet routes
  app.get("/api/cabinets", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || "";
      
      const result = await storage.getCabinets(page, limit, search);
      res.json(result);
    } catch (error) {
      console.error("Get cabinets error:", error);
      res.status(500).json({ message: "Failed to fetch cabinets" });
    }
  });

  app.post("/api/cabinets", requireAuth, async (req, res) => {
    try {
      const cabinetData = insertCabinetSchema.parse(req.body);
      const cabinet = await storage.createCabinet(cabinetData);
      res.status(201).json(cabinet);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create cabinet error:", error);
      res.status(500).json({ message: "Failed to create cabinet" });
    }
  });

  app.get("/api/cabinets/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cabinet = await storage.getCabinet(id);
      if (!cabinet) {
        return res.status(404).json({ message: "Cabinet not found" });
      }
      res.json(cabinet);
    } catch (error) {
      console.error("Get cabinet error:", error);
      res.status(500).json({ message: "Failed to fetch cabinet" });
    }
  });

  app.put("/api/cabinets/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cabinetData = insertCabinetSchema.partial().parse(req.body);
      const cabinet = await storage.updateCabinet(id, cabinetData);
      res.json(cabinet);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update cabinet error:", error);
      res.status(500).json({ message: "Failed to update cabinet" });
    }
  });

  app.delete("/api/cabinets/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCabinet(id);
      res.json({ message: "Cabinet deleted successfully" });
    } catch (error) {
      console.error("Delete cabinet error:", error);
      res.status(500).json({ message: "Failed to delete cabinet" });
    }
  });

  // Game Mix routes
  app.get("/api/game-mixes", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || "";
      
      const result = await storage.getGameMixes(page, limit, search);
      res.json(result);
    } catch (error) {
      console.error("Get game mixes error:", error);
      res.status(500).json({ message: "Failed to fetch game mixes" });
    }
  });

  app.post("/api/game-mixes", requireAuth, async (req, res) => {
    try {
      const gameMixData = insertGameMixSchema.parse(req.body);
      const gameMix = await storage.createGameMix(gameMixData);
      res.status(201).json(gameMix);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create game mix error:", error);
      res.status(500).json({ message: "Failed to create game mix" });
    }
  });

  app.get("/api/game-mixes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const gameMix = await storage.getGameMix(id);
      if (!gameMix) {
        return res.status(404).json({ message: "Game mix not found" });
      }
      res.json(gameMix);
    } catch (error) {
      console.error("Get game mix error:", error);
      res.status(500).json({ message: "Failed to fetch game mix" });
    }
  });

  app.put("/api/game-mixes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const gameMixData = insertGameMixSchema.partial().parse(req.body);
      const gameMix = await storage.updateGameMix(id, gameMixData);
      res.json(gameMix);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update game mix error:", error);
      res.status(500).json({ message: "Failed to update game mix" });
    }
  });

  app.delete("/api/game-mixes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGameMix(id);
      res.json({ message: "Game mix deleted successfully" });
    } catch (error) {
      console.error("Delete game mix error:", error);
      res.status(500).json({ message: "Failed to delete game mix" });
    }
  });

  // Slot routes
  app.get("/api/slots", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || "";
      
      const result = await storage.getSlots(page, limit, search);
      res.json(result);
    } catch (error) {
      console.error("Get slots error:", error);
      res.status(500).json({ message: "Failed to fetch slots" });
    }
  });

  app.post("/api/slots", requireAuth, async (req, res) => {
    try {
      const slotData = insertSlotSchema.parse(req.body);
      const slot = await storage.createSlot(slotData);
      res.status(201).json(slot);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create slot error:", error);
      res.status(500).json({ message: "Failed to create slot" });
    }
  });

  app.get("/api/slots/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const slot = await storage.getSlot(id);
      if (!slot) {
        return res.status(404).json({ message: "Slot not found" });
      }
      res.json(slot);
    } catch (error) {
      console.error("Get slot error:", error);
      res.status(500).json({ message: "Failed to fetch slot" });
    }
  });

  app.put("/api/slots/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const slotData = insertSlotSchema.partial().parse(req.body);
      const slot = await storage.updateSlot(id, slotData);
      res.json(slot);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update slot error:", error);
      res.status(500).json({ message: "Failed to update slot" });
    }
  });

  app.delete("/api/slots/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSlot(id);
      res.json({ message: "Slot deleted successfully" });
    } catch (error) {
      console.error("Delete slot error:", error);
      res.status(500).json({ message: "Failed to delete slot" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || "";
      
      const result = await storage.getInvoices(page, limit, search);
      res.json(result);
    } catch (error) {
      console.error("Get invoices error:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", requireAuth, async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create invoice error:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.get("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Get invoice error:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.put("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoiceData = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(id, invoiceData);
      res.json(invoice);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update invoice error:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.delete("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteInvoice(id);
      res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
      console.error("Delete invoice error:", error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Rent Agreement routes
  app.get("/api/rent-agreements", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || "";
      
      const result = await storage.getRentAgreements(page, limit, search);
      res.json(result);
    } catch (error) {
      console.error("Get rent agreements error:", error);
      res.status(500).json({ message: "Failed to fetch rent agreements" });
    }
  });

  app.post("/api/rent-agreements", requireAuth, async (req, res) => {
    try {
      const rentAgreementData = insertRentAgreementSchema.parse(req.body);
      const rentAgreement = await storage.createRentAgreement(rentAgreementData);
      res.status(201).json(rentAgreement);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create rent agreement error:", error);
      res.status(500).json({ message: "Failed to create rent agreement" });
    }
  });

  app.get("/api/rent-agreements/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const rentAgreement = await storage.getRentAgreement(id);
      if (!rentAgreement) {
        return res.status(404).json({ message: "Rent agreement not found" });
      }
      res.json(rentAgreement);
    } catch (error) {
      console.error("Get rent agreement error:", error);
      res.status(500).json({ message: "Failed to fetch rent agreement" });
    }
  });

  app.put("/api/rent-agreements/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const rentAgreementData = insertRentAgreementSchema.partial().parse(req.body);
      const rentAgreement = await storage.updateRentAgreement(id, rentAgreementData);
      res.json(rentAgreement);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update rent agreement error:", error);
      res.status(500).json({ message: "Failed to update rent agreement" });
    }
  });

  app.delete("/api/rent-agreements/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRentAgreement(id);
      res.json({ message: "Rent agreement deleted successfully" });
    } catch (error) {
      console.error("Delete rent agreement error:", error);
      res.status(500).json({ message: "Failed to delete rent agreement" });
    }
  });

  // User routes (admin only)
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || "";
      
      const result = await storage.getUsers(page, limit, search);
      res.json(result);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName,
        role: user.role 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create user error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName,
        role: user.role 
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName,
        role: user.role 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update user error:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Legal Document routes
  app.get("/api/legal-documents", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || "";
      
      const result = await storage.getLegalDocuments(page, limit, search);
      res.json(result);
    } catch (error) {
      console.error("Get legal documents error:", error);
      res.status(500).json({ message: "Failed to fetch legal documents" });
    }
  });

  app.post("/api/legal-documents", requireAuth, async (req, res) => {
    try {
      const legalDocumentData = insertLegalDocumentSchema.parse(req.body);
      const legalDocument = await storage.createLegalDocument(legalDocumentData);
      res.status(201).json(legalDocument);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create legal document error:", error);
      res.status(500).json({ message: "Failed to create legal document" });
    }
  });

  app.get("/api/legal-documents/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const legalDocument = await storage.getLegalDocument(id);
      if (!legalDocument) {
        return res.status(404).json({ message: "Legal document not found" });
      }
      res.json(legalDocument);
    } catch (error) {
      console.error("Get legal document error:", error);
      res.status(500).json({ message: "Failed to fetch legal document" });
    }
  });

  app.put("/api/legal-documents/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const legalDocumentData = insertLegalDocumentSchema.partial().parse(req.body);
      const legalDocument = await storage.updateLegalDocument(id, legalDocumentData);
      res.json(legalDocument);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update legal document error:", error);
      res.status(500).json({ message: "Failed to update legal document" });
    }
  });

  app.delete("/api/legal-documents/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLegalDocument(id);
      res.json({ message: "Legal document deleted successfully" });
    } catch (error) {
      console.error("Delete legal document error:", error);
      res.status(500).json({ message: "Failed to delete legal document" });
    }
  });

  // ONJN Report routes
  app.get("/api/onjn-reports", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || "";
      
      const result = await storage.getOnjnReports(page, limit, search);
      res.json(result);
    } catch (error) {
      console.error("Get ONJN reports error:", error);
      res.status(500).json({ message: "Failed to fetch ONJN reports" });
    }
  });

  app.post("/api/onjn-reports", requireAuth, async (req, res) => {
    try {
      const onjnReportData = insertOnjnReportSchema.parse(req.body);
      const onjnReport = await storage.createOnjnReport(onjnReportData);
      res.status(201).json(onjnReport);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create ONJN report error:", error);
      res.status(500).json({ message: "Failed to create ONJN report" });
    }
  });

  app.get("/api/onjn-reports/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const onjnReport = await storage.getOnjnReport(id);
      if (!onjnReport) {
        return res.status(404).json({ message: "ONJN report not found" });
      }
      res.json(onjnReport);
    } catch (error) {
      console.error("Get ONJN report error:", error);
      res.status(500).json({ message: "Failed to fetch ONJN report" });
    }
  });

  app.put("/api/onjn-reports/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const onjnReportData = insertOnjnReportSchema.partial().parse(req.body);
      const onjnReport = await storage.updateOnjnReport(id, onjnReportData);
      res.json(onjnReport);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update ONJN report error:", error);
      res.status(500).json({ message: "Failed to update ONJN report" });
    }
  });

  app.delete("/api/onjn-reports/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteOnjnReport(id);
      res.json({ message: "ONJN report deleted successfully" });
    } catch (error) {
      console.error("Delete ONJN report error:", error);
      res.status(500).json({ message: "Failed to delete ONJN report" });
    }
  });

  // Activity Log routes
  app.get("/api/activity-logs", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await storage.getActivityLogs(page, limit);
      res.json(result);
    } catch (error) {
      console.error("Get activity logs error:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
