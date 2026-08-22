import { createServer } from "http";
import express, { Express } from "express";
import helmet from "helmet";
import { getConfig, getEnvironment, Env } from "./config";
import { createRoutes } from "./routes";
import { createTemplates } from "./helpers";
import { createErrorHandlers } from "./error";
import { createSessions } from "./session";
import { createAuthentication } from "./authentication";
import httpProxy from "http-proxy";
import { engine } from "express-handlebars";
import { uploadDir } from "./routes/user_helpers";
import path from "path";
import cors from 'cors';
import { corsOption } from "./cors";

const port = getConfig("http:port", 5000);

const expressApp: Express = express();

expressApp.use(cors(corsOption));
expressApp.use(helmet(getConfig("http:content_security", {})));
expressApp.use(express.json());
expressApp.use(express.urlencoded({extended:true}));

expressApp.engine("handlebars", engine({ defaultLayout: false,
    layoutsDir: path.join(__dirname, "templates/supplier")
}));


expressApp.set("view engine", "handlebars");
expressApp.set("views", path.join(__dirname,"templates"));

expressApp.use(express.json({
    type: ["application/json", "application/json-patch+json"]
}));


// Vercel ignores express.static() and only serves files under public/**
// directly via its CDN; webpack now builds bundle.js/style.css/pics and
// copies the vendor CSS/JS (bootstrap, bootstrap-icons, flatpickr, htmx)
// there too, so this one mount covers local dev and matches what Vercel
// serves in production.
expressApp.use(express.static("public"));
// Local-dev-only fallback for uploads written to disk; in production these
// are served directly from Vercel Blob's own URL, not through this route.
expressApp.use("/uploads", express.static(uploadDir));

createTemplates(expressApp);
createSessions(expressApp);

createAuthentication(expressApp);

createRoutes(expressApp);
//createErrorHandlers(expressApp);

const server = createServer(expressApp);

console.log("Current environment:", getEnvironment(),Env.Development);
if(getEnvironment() === Env.Development) {
    const proxy = httpProxy.createProxyServer({
        target: "http://localhost:5100", ws:true
    });
    proxy.on('error', (err, req, resp) => {
        console.error("Proxy error (is `npm run client` / webpack-dev-server running on :5100?):", err.message);
        if (resp && 'writeHead' in resp && !resp.headersSent) {
            resp.writeHead(502, { "Content-Type": "text/plain" });
            resp.end("Admin/supplier dev server is not running. Start it with `npm run client`.");
        }
    });
    expressApp.use("/supplier", (req,resp) => proxy.web(req, resp));
    expressApp.use("/admin", (req,resp) => proxy.web(req, resp));
    server.on('upgrade', (req, socket, head) => proxy.ws(req, socket, head));
}else{
    const proxy = httpProxy.createProxyServer({
        target: "https://rentorbuy-db.internal", ws:true
    });
    proxy.on('error', (err, req, resp) => {
        console.error("Proxy error:", err.message);
        if (resp && 'writeHead' in resp && !resp.headersSent) {
            resp.writeHead(502, { "Content-Type": "text/plain" });
            resp.end("Bad gateway");
        }
    });
    expressApp.use("/supplier", (req,resp) => proxy.web(req, resp));
    expressApp.use("/admin", (req,resp) => proxy.web(req, resp));
    server.on('upgrade', (req, socket, head) => proxy.ws(req, socket, head));
}

createErrorHandlers(expressApp);

server.listen(port, () => console.log(`HTTP Server listening on port ${port}`));

export default expressApp;