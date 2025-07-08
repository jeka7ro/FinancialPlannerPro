import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import multer from "multer";
import path from "path";
import { storage } from "./storage.js";
import { importExportService } from "./services/importExportService.js";
import { fileService } from "./services/fileService.js";
import { exportTemplateService } from "./services/exportTemplateService.js";
import { logoService } from "./services/logoService.js";
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
} from "../shared/schema.js";
import { ZodError } from "zod";
import { geocodeAddress } from './services/geocodeService.js';

// Session configuration optimized for deployment
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "your-secret-key-here",
  resave: true, // Force session save
  saveUninitialized: true, // Create session even if not modified
  rolling: true, // Reset expiration on activity
  cookie: {
    secure: false, // Required for Replit deployment
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for stability
    sameSite: 'lax' as const,
  },
  name: 'sessionId', // Explicit session name
};

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files are allowed.'));
    }
  }
});

// Multer configuration for general file attachments
const uploadAttachment = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (fileService.isValidFileType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type.'));
    }
  }
});

// Middleware to check if user is authenticated
const requireAuth = (req: any, res: any, next: any) => {
  console.log("Auth check - Session:", req.session?.userId ? "exists" : "missing");
  console.log("Auth check - Headers:", req.headers.cookie ? "has cookies" : "no cookies");
  
  if (!req.session?.userId) {
    console.log("Unauthorized request to:", req.path);
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
  // CORS configuration for development
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (origin === 'http://localhost:5174' || origin === 'http://localhost:5173')) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Session middleware
  app.use(session(sessionConfig));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      console.log("Login attempt for username:", username);
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.authenticateUser(username, password);
      if (!user) {
        console.log("Authentication failed for username:", username);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log("Setting session for user:", user.id);
      (req.session as any).userId = user.id;
      (req.session as any).userRole = user.role;
      
      // Force session save
      req.session.save((err: any) => {
        if (err) {
          console.error("Session save error:", err);
        } else {
          console.log("Session saved successfully for user:", user.id);
        }
      });
      
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

  // Get current user - remove requireAuth to break circular dependency
  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      console.log("Get user request - Session userId:", userId);
      console.log("Session object:", req.session);
      
      if (!userId) {
        console.log("No session found");
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        console.log("User not found for ID:", userId);
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

  app.get("/api/companies/:id(\\d+)", requireAuth, async (req, res) => {
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

  app.post("/api/companies/bulk-delete", requireAuth, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid IDs provided" });
      }
      await storage.bulkDeleteCompanies(ids);
      res.json({ message: `${ids.length} companies deleted successfully` });
    } catch (error) {
      console.error("Bulk delete companies error:", error);
      res.status(500).json({ message: "Failed to delete companies" });
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
      let { latitude, longitude, address, city } = locationData;
      if ((latitude == null || longitude == null) && (address || city)) {
        const geoResult = await geocodeAddress((address || city || ''));
        if (geoResult) {
          latitude = String(geoResult.lat);
          longitude = String(geoResult.lon);
        }
      }
      const location = await storage.createLocation({ ...locationData, latitude, longitude });
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create location error:", error);
      res.status(500).json({ message: "Failed to create location" });
    }
  });

  app.get("/api/locations/:id(\\d+)", requireAuth, async (req, res) => {
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
      let { latitude, longitude, address, city } = locationData;
      if ((latitude == null || longitude == null) && (address || city)) {
        const geoResult = await geocodeAddress((address || city || ''));
        if (geoResult) {
          latitude = String(geoResult.lat);
          longitude = String(geoResult.lon);
        }
      }
      const location = await storage.updateLocation(id, { ...locationData, latitude, longitude });
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

  app.get("/api/providers/:id(\\d+)", requireAuth, async (req, res) => {
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

  app.post("/api/providers/bulk-delete", requireAuth, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid IDs provided" });
      }
      
      for (const id of ids) {
        await storage.deleteProvider(parseInt(id));
      }
      
      res.json({ message: `${ids.length} providers deleted successfully` });
    } catch (error) {
      console.error("Bulk delete providers error:", error);
      res.status(500).json({ message: "Failed to delete providers" });
    }
  });

  // Cabinet routes
  app.get("/api/cabinets", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || "";
      const providers = req.query.providers as string || "";
      const models = req.query.models as string || "";
      
      const result = await storage.getCabinets(page, limit, search, providers, models);
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

  app.get("/api/cabinets/:id(\\d+)", requireAuth, async (req, res) => {
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
      const sortField = req.query.sortField as string || "id";
      const sortDirection = req.query.sortDirection as string || "asc";
      
      console.log("Slots search request:", { page, limit, search, sortField, sortDirection });
      
      const result = await storage.getSlots(page, limit, search, sortField, sortDirection);
      res.json(result);
    } catch (error) {
      console.error("Get slots error:", error);
      res.status(500).json({ message: "Failed to fetch slots" });
    }
  });

  app.post("/api/slots", requireAuth, async (req, res) => {
    try {
      // Preprocess ALL numeric and decimal fields to convert empty strings to undefined
      const preprocessedData = { ...req.body };
      
      // Handle all numeric and decimal fields
      ['year', 'gamingPlaces', 'rtp', 'cabinetId', 'gameMixId', 'providerId', 'locationId', 'denomination', 'maxBet', 'ownerId', 'invoiceId', 'onjnReportId', 'dailyRevenue'].forEach(field => {
        if (preprocessedData[field] === "" || preprocessedData[field] === null) {
          preprocessedData[field] = undefined;
        }
      });
      
      // Handle date fields - convert ISO strings to Date objects
      if (preprocessedData.commissionDate && typeof preprocessedData.commissionDate === 'string') {
        preprocessedData.commissionDate = new Date(preprocessedData.commissionDate);
      }
      
      const slotData = insertSlotSchema.parse(preprocessedData);
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
      
      console.log("Original request body:", req.body);
      
      // Preprocess ALL fields to convert empty strings to null/undefined for numeric fields
      const preprocessedData = { ...req.body };
      
      // Handle all numeric and decimal fields
      ['year', 'gamingPlaces', 'rtp', 'cabinetId', 'gameMixId', 'providerId', 'locationId', 'denomination', 'maxBet', 'ownerId', 'invoiceId', 'onjnReportId', 'dailyRevenue'].forEach(field => {
        if (preprocessedData[field] === "" || preprocessedData[field] === null) {
          preprocessedData[field] = undefined;
        }
      });
      
      // Handle date fields - convert ISO strings to Date objects
      if (preprocessedData.commissionDate && typeof preprocessedData.commissionDate === 'string') {
        preprocessedData.commissionDate = new Date(preprocessedData.commissionDate);
      }
      
      console.log("Preprocessed data:", preprocessedData);
      
      const slotData = insertSlotSchema.partial().parse(preprocessedData);
      console.log("Parsed slot data:", slotData);
      
      const slot = await storage.updateSlot(id, slotData);
      res.json(slot);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Zod validation error:", error.errors);
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
      console.log("Invoice creation request body:", JSON.stringify(req.body, null, 2));
      
      // Preprocess data to handle frontend-backend data type mismatches
      const preprocessedData = { ...req.body };
      
      // Handle locationIds: convert string to array
      if (typeof preprocessedData.locationIds === 'string') {
        if (preprocessedData.locationIds === '' || preprocessedData.locationIds === null || preprocessedData.locationIds === undefined) {
          preprocessedData.locationIds = [];
        } else {
          // Split by comma or convert single string to array
          preprocessedData.locationIds = preprocessedData.locationIds.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
        }
      }
      
      // Handle numeric fields that might be strings
      if (typeof preprocessedData.amortizationMonths === 'string') {
        preprocessedData.amortizationMonths = preprocessedData.amortizationMonths === '' ? 12 : parseInt(preprocessedData.amortizationMonths);
      }
      
      // Ensure companyId and sellerCompanyId are numbers
      if (typeof preprocessedData.companyId === 'string') {
        preprocessedData.companyId = parseInt(preprocessedData.companyId);
      }
      if (typeof preprocessedData.sellerCompanyId === 'string') {
        preprocessedData.sellerCompanyId = parseInt(preprocessedData.sellerCompanyId);
      }
      
      console.log("Preprocessed invoice data:", JSON.stringify(preprocessedData, null, 2));
      
      const invoiceData = insertInvoiceSchema.parse(preprocessedData);
      
      // Add the current user ID to createdBy field
      const invoiceWithCreatedBy = {
        ...invoiceData,
        createdBy: (req.session as any).userId,
      };
      
      const invoice = await storage.createInvoice(invoiceWithCreatedBy);
      
      // If invoice has serial numbers, create ONJN report
      if (invoiceData.serialNumbers) {
        const serialNumbers = invoiceData.serialNumbers.split(' ').filter(sn => sn.trim());
        
        for (const serialNumber of serialNumbers) {
          try {
            const onjnReport = await storage.createOnjnReport({
              reportDate: new Date(),
              status: 'pending',
              companyId: invoiceData.companyId,
              locationIds: invoiceData.locationIds,
              serialNumbers: serialNumber,
              notes: `Commission for invoice ${invoiceData.invoiceNumber}`,
            });
          } catch (onjnError) {
            console.error(`Failed to create ONJN report for serial ${serialNumber}:`, onjnError);
          }
        }
      }
      
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Invoice validation errors:", JSON.stringify(error.errors, null, 2));
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
      
      // Preprocess data to handle frontend-backend data type mismatches
      const preprocessedData = { ...req.body };
      
      // Handle locationIds: convert string to array
      if (typeof preprocessedData.locationIds === 'string') {
        if (preprocessedData.locationIds === '' || preprocessedData.locationIds === null || preprocessedData.locationIds === undefined) {
          preprocessedData.locationIds = [];
        } else {
          preprocessedData.locationIds = preprocessedData.locationIds.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
        }
      }
      
      // Handle numeric fields that might be strings
      if (typeof preprocessedData.amortizationMonths === 'string') {
        preprocessedData.amortizationMonths = preprocessedData.amortizationMonths === '' ? undefined : parseInt(preprocessedData.amortizationMonths);
      }
      
      // Ensure companyId and sellerCompanyId are numbers
      if (typeof preprocessedData.companyId === 'string') {
        preprocessedData.companyId = parseInt(preprocessedData.companyId);
      }
      if (typeof preprocessedData.sellerCompanyId === 'string') {
        preprocessedData.sellerCompanyId = parseInt(preprocessedData.sellerCompanyId);
      }
      
      const invoiceData = insertInvoiceSchema.partial().parse(preprocessedData);
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

  app.post("/api/invoices/bulk-delete", requireAuth, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid IDs provided" });
      }
      
      for (const id of ids) {
        await storage.deleteInvoice(parseInt(id));
      }
      
      res.json({ message: `${ids.length} invoices deleted successfully` });
    } catch (error) {
      console.error("Bulk delete invoices error:", error);
      res.status(500).json({ message: "Failed to delete invoices" });
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
      const { locationIds, ...userData } = req.body;
      const user = await storage.createUser(userData);
      
      // Assign locations to the user if provided
      if (locationIds && locationIds.length > 0) {
        await storage.assignUserToLocations(user.id, locationIds);
      }
      
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

  app.get("/api/users/:id(\\d+)", requireAuth, async (req, res) => {
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
      const { locationIds, ...userData } = req.body;
      const user = await storage.updateUser(id, userData);
      
      // Update user location assignments if provided
      if (locationIds !== undefined) {
        // First remove all existing location assignments
        const existingLocations = await storage.getUserLocations(id);
        for (const location of existingLocations) {
          await storage.removeUserFromLocation(id, location.locationId);
        }
        
        // Then assign new locations
        if (locationIds.length > 0) {
          await storage.assignUserToLocations(id, locationIds);
        }
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

  // User location routes
  app.get("/api/users/:id/locations", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userLocations = await storage.getUserLocations(userId);
      res.json(userLocations);
    } catch (error) {
      console.error("Get user locations error:", error);
      res.status(500).json({ message: "Failed to fetch user locations" });
    }
  });

  app.post("/api/users/:id/locations", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { locationIds } = req.body;
      
      if (!locationIds || !Array.isArray(locationIds)) {
        return res.status(400).json({ message: "Location IDs are required" });
      }
      
      await storage.assignUserToLocations(userId, locationIds);
      res.json({ message: "User assigned to locations successfully" });
    } catch (error) {
      console.error("Assign user to locations error:", error);
      res.status(500).json({ message: "Failed to assign user to locations" });
    }
  });

  app.delete("/api/users/:userId/locations/:locationId", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const locationId = parseInt(req.params.locationId);
      
      await storage.removeUserFromLocation(userId, locationId);
      res.json({ message: "User removed from location successfully" });
    } catch (error) {
      console.error("Remove user from location error:", error);
      res.status(500).json({ message: "Failed to remove user from location" });
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

  app.post("/api/legal-documents/bulk-delete", requireAuth, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid IDs provided" });
      }
      
      for (const id of ids) {
        await storage.deleteLegalDocument(parseInt(id));
      }
      
      res.json({ message: `${ids.length} legal documents deleted successfully` });
    } catch (error) {
      console.error("Bulk delete legal documents error:", error);
      res.status(500).json({ message: "Failed to delete legal documents" });
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

  app.post("/api/onjn-reports/bulk-delete", requireAuth, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid IDs provided" });
      }
      
      for (const id of ids) {
        await storage.deleteOnjnReport(parseInt(id));
      }
      
      res.json({ message: `${ids.length} ONJN reports deleted successfully` });
    } catch (error) {
      console.error("Bulk delete ONJN reports error:", error);
      res.status(500).json({ message: "Failed to delete ONJN reports" });
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





  app.get("/api/attachments/:id/download", requireAuth, async (req: any, res: any) => {
    try {
      const attachmentId = parseInt(req.params.id);
      const attachment = await storage.getAttachment(attachmentId);
      
      if (!attachment) {
        return res.status(404).json({ message: "Attachment not found" });
      }

      const filename = attachment.filePath.split('/').pop();
      const fileData = await fileService.getFile(filename!);

      res.setHeader('Content-Type', attachment.mimeType);
      
      // For images and PDFs, show inline for preview
      if (attachment.mimeType.startsWith('image/') || attachment.mimeType === 'application/pdf') {
        res.setHeader('Content-Disposition', `inline; filename="${attachment.originalName}"`);
      } else {
        // For other files, force download
        res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
      }
      
      res.send(fileData);
    } catch (error: any) {
      console.error("Download error:", error);
      res.status(500).json({ message: "Download failed", error: error.message });
    }
  });

  app.delete("/api/attachments/:id", requireAuth, async (req: any, res: any) => {
    try {
      const attachmentId = parseInt(req.params.id);
      await fileService.deleteFile(attachmentId);
      res.json({ message: "File deleted successfully" });
    } catch (error: any) {
      console.error("Delete file error:", error);
      res.status(500).json({ message: "Delete failed", error: error.message });
    }
  });

  // Static file serving for uploads
  app.get("/uploads/:filename", (req: any, res: any) => {
    const filename = req.params.filename;
    res.sendFile(path.join(process.cwd(), 'uploads', filename));
  });

  // Logo serving
  app.get("/uploads/logos/:filename", (req: any, res: any) => {
    const filename = req.params.filename;
    res.sendFile(path.join(process.cwd(), 'uploads', 'logos', filename));
  });

  app.get("/api/import-tutorial", requireAuth, async (req: any, res: any) => {
    try {
      const buffer = exportTemplateService.generateImportTutorialPDF();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=import-tutorial.pdf');
      res.send(buffer);
    } catch (error: any) {
      console.error("Tutorial export error:", error);
      res.status(500).json({ message: "Tutorial export failed", error: error.message });
    }
  });

  // Import/Export routes - MUST be at the end to avoid interfering with specific routes
  app.post("/api/:module/import", requireAuth, upload.single('file'), async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const module = req.params.module;
      const result = await importExportService.importFromExcel(module, req.file.buffer);
      
      res.json(result);
    } catch (error: any) {
      console.error("Import error:", error);
      res.status(500).json({ message: "Import failed", error: error.message });
    }
  });

  app.get("/api/:module/template", requireAuth, async (req: any, res: any) => {
    try {
      const module = req.params.module;
      const buffer = exportTemplateService.getTemplate(module);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${module}-template.xlsx`);
      res.send(buffer);
    } catch (error: any) {
      console.error("Template export error:", error);
      res.status(500).json({ message: "Template export failed", error: error.message });
    }
  });

  app.get("/api/:module/export/excel", requireAuth, async (req, res) => {
    try {
      const module = req.params.module;
      const buffer = await importExportService.exportToExcel(module);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${module}-export.xlsx`);
      res.send(buffer);
    } catch (error: any) {
      console.error("Excel export error:", error);
      res.status(500).json({ message: "Export failed", error: error.message });
    }
  });

  app.get("/api/:module/export/pdf", requireAuth, async (req, res) => {
    try {
      const module = req.params.module;
      const buffer = await importExportService.exportToPDF(module);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${module}-report.pdf`);
      res.send(buffer);
    } catch (error: any) {
      console.error("PDF export error:", error);
      res.status(500).json({ message: "Export failed", error: error.message });
    }
  });

  // File attachment routes - MUST be at the end to avoid interfering with specific routes
  app.post("/api/:entityType/:entityId/attachments", requireAuth, uploadAttachment.single('file'), async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { entityType, entityId } = req.params;
      const { description } = req.body;
      const userId = (req.session as any).userId;

      const attachment = await fileService.saveFile(
        req.file,
        entityType,
        parseInt(entityId),
        userId,
        description
      );

      res.json(attachment);
    } catch (error: any) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "Upload failed", error: error.message });
    }
  });

  app.get("/api/:entityType/:entityId/attachments", requireAuth, async (req: any, res: any) => {
    try {
      const { entityType, entityId } = req.params;
      const attachments = await storage.getAttachments(entityType, parseInt(entityId));
      res.json(attachments);
    } catch (error: any) {
      console.error("Get attachments error:", error);
      res.status(500).json({ message: "Failed to fetch attachments", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
