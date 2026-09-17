import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Minimal 1x1 transparent PNG (valid PNG format)
const minimalPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

const publicDir = path.join(__dirname, "..", "public");
fs.writeFileSync(path.join(publicDir, "icon-192.png"), minimalPng);
fs.writeFileSync(path.join(publicDir, "icon-512.png"), minimalPng);
