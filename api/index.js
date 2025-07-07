import 'dotenv/config';
import express from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
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
// Initialize routes
(async () => {
    await registerRoutes(app);
})();
// Error handling middleware
app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
});
// Development setup
if (!process.env.VERCEL && app.get("env") === "development") {
    (async () => {
        const server = await registerRoutes(app);
        await setupVite(app, server);
        const port = parseInt(process.env.PORT || "3001");
        server.listen(port, () => {
            log(`serving on port ${port}`);
        });
    })();
}
// Production static serving
if (!process.env.VERCEL && app.get("env") === "production") {
    serveStatic(app);
    const port = parseInt(process.env.PORT || "3001");
    app.listen(port, () => {
        log(`serving on port ${port}`);
    });
}
// Export for Vercel serverless functions
export default function handler(req, res) {
  res.status(200).json({ message: 'API is working!', path: req.url });
}
