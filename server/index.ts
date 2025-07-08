import 'dotenv/config';
import { config } from 'dotenv';
import path from 'path';

// Load .env.local if it exists
config({ path: path.resolve(process.cwd(), '.env.local') });

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  throw err;
});

// Development setup
if (!process.env.VERCEL && app.get("env") === "development") {
  console.log("🚀 Starting development server...");
  (async () => {
    try {
      console.log("📝 Registering routes...");
      const server = await registerRoutes(app);
      console.log("✅ Routes registered successfully");
      
      console.log("⚡ Setting up Vite...");
      await setupVite(app, server);
      console.log("✅ Vite setup completed");
      
      const port = parseInt(process.env.PORT || "3001");
      console.log(`🌐 Starting server on port ${port}...`);
      server.listen(port, () => {
        console.log(`✅ Server running on port ${port}`);
        console.log(`🌐 Health check: http://localhost:${port}/api/health`);
        console.log(`🔐 Login: POST http://localhost:${port}/api/auth/login`);
        log(`serving on port ${port}`);
      });
    } catch (error) {
      console.error("❌ Error starting server:", error);
      process.exit(1);
    }
  })();
}

// Production static serving
if (!process.env.VERCEL && app.get("env") === "production") {
  console.log("🚀 Starting production server...");
  (async () => {
    try {
      await registerRoutes(app);
      serveStatic(app);
      const port = parseInt(process.env.PORT || "3001");
      app.listen(port, () => {
        console.log(`✅ Production server running on port ${port}`);
        log(`serving on port ${port}`);
      });
    } catch (error) {
      console.error("❌ Error starting production server:", error);
      process.exit(1);
    }
  })();
}

// Keep the process alive - this is crucial!
const keepAlive = setInterval(() => {
  // This keeps the event loop active
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Server keep-alive tick...');
  }
}, 30000); // Every 30 seconds

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  clearInterval(keepAlive);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  clearInterval(keepAlive);
  process.exit(0);
});

// Export for Vercel serverless functions
export default app;
