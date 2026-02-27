const fs = require("fs");
const path = require("path");

// Minimal 1x1 transparent PNG (valid PNG format)
const minimalPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

const publicDir = path.join(__dirname, "..", "public");
fs.writeFileSync(path.join(publicDir, "icon-192.png"), minimalPng);
fs.writeFileSync(path.join(publicDir, "icon-512.png"), minimalPng);
