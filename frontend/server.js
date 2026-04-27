import fs from "fs/promises";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "dist");
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp"
};

const safeResolve = (urlPath) => {
  const decodedPath = decodeURIComponent(urlPath.split("?")[0]);
  const requestedPath = path.normalize(decodedPath === "/" ? "/index.html" : decodedPath);
  const absolutePath = path.join(distDir, requestedPath);

  if (!absolutePath.startsWith(distDir)) {
    return path.join(distDir, "index.html");
  }

  return absolutePath;
};

const sendFile = async (res, filePath) => {
  const data = await fs.readFile(filePath);
  const extension = path.extname(filePath);

  res.writeHead(200, {
    "Content-Type": contentTypes[extension] || "application/octet-stream",
    "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=31536000, immutable"
  });
  res.end(data);
};

const server = http.createServer(async (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  try {
    const filePath = safeResolve(req.url || "/");
    await sendFile(res, filePath);
  } catch (_error) {
    try {
      await sendFile(res, path.join(distDir, "index.html"));
    } catch {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Unable to serve frontend");
    }
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Frontend static server running on port ${port}`);
});
