// Generates a self-signed TLS certificate for local development into ./certs.
// Requires `openssl` on the PATH (bundled with Git for Windows, macOS and most Linux distros).
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const certDir = path.join(__dirname, "..", "certs");
const keyPath = path.join(certDir, "key.pem");
const certPath = path.join(certDir, "cert.pem");

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log(`Certificates already exist in ${certDir}`);
  process.exit(0);
}

fs.mkdirSync(certDir, { recursive: true });
execFileSync(
  "openssl",
  ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-sha256", "-days", "365",
   "-subj", "/CN=localhost", "-keyout", keyPath, "-out", certPath],
  { stdio: "inherit" }
);
console.log(`Self-signed certificate written to ${certDir}`);
