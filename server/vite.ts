import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer, createLogger } from "vite";
import { type Server } from "http";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createServer({
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Skip API routes to avoid interfering with backend endpoints
    if (url.startsWith("/api")) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Try multiple possible paths for the dist directory
  const possiblePaths = [
    path.resolve(import.meta.dirname, "..", "client", "dist"),
    path.resolve(process.cwd(), "client", "dist"),
    path.resolve(process.cwd(), "dist"),
    path.resolve(import.meta.dirname, "..", "dist"),
    path.resolve(process.cwd(), "..", "client", "dist"),
    path.resolve(process.cwd(), "..", "dist"),
    path.resolve("/opt/render/project/src/client/dist"),
    path.resolve("/opt/render/project/src/dist"),
  ];

  console.log(`🔧 Current working directory: ${process.cwd()}`);
  console.log(`🔧 Server directory: ${import.meta.dirname}`);
  console.log(`🔧 Searching for dist directory...`);

  let distPath: string | null = null;
  
  for (const testPath of possiblePaths) {
    console.log(`🔧 Checking path: ${testPath}`);
    if (fs.existsSync(testPath)) {
      distPath = testPath;
      console.log(`✅ Found dist directory at: ${distPath}`);
      break;
    } else {
      console.log(`❌ Path not found: ${testPath}`);
    }
  }

  if (!distPath) {
    console.error("❌ Could not find dist directory. Searched paths:");
    possiblePaths.forEach((p, i) => {
      console.error(`  ${i + 1}. ${p} - ${fs.existsSync(p) ? 'EXISTS' : 'NOT FOUND'}`);
    });
    
    // Let's also check what directories actually exist
    console.log("🔧 Checking what directories exist:");
    const rootDir = process.cwd();
    try {
      const rootContents = fs.readdirSync(rootDir);
      console.log(`🔧 Root directory (${rootDir}) contents:`, rootContents);
      
      const clientDir = path.resolve(rootDir, "client");
      if (fs.existsSync(clientDir)) {
        const clientContents = fs.readdirSync(clientDir);
        console.log(`🔧 Client directory (${clientDir}) contents:`, clientContents);
      } else {
        console.log(`❌ Client directory not found: ${clientDir}`);
      }
    } catch (error) {
      console.error("❌ Error reading directories:", error);
    }
    
    throw new Error(
      `Could not find the build directory. Searched: ${possiblePaths.join(', ')}`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath!, "index.html"));
  });
}
