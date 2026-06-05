import { networkInterfaces } from "os";
import { readFileSync, writeFileSync } from "fs";

// Détecte automatiquement l'IP locale correcte
function getLocalIP() {
  const nets = networkInterfaces();

  // Priorité au Wi-Fi / partage de connexion téléphone
  const preferredNames = ["wi-fi", "wifi", "wlan"];

  for (const name of Object.keys(nets)) {
    const lower = name.toLowerCase();

    // On cherche d'abord la vraie carte réseau Wi-Fi
    if (!preferredNames.some((p) => lower.includes(p))) {
      continue;
    }

    for (const net of nets[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }

  // Fallback : ignore les interfaces virtuelles
  for (const name of Object.keys(nets)) {
    const lower = name.toLowerCase();

    if (
      lower.includes("virtual") ||
      lower.includes("vmware") ||
      lower.includes("vethernet") ||
      lower.includes("wsl") ||
      lower.includes("loopback") ||
      lower.includes("bluetooth")
    ) {
      continue;
    }

    for (const net of nets[name] ?? []) {
      if (
        net.family === "IPv4" &&
        !net.internal &&
        !net.address.startsWith("192.168.56.") && // VirtualBox
        !net.address.startsWith("172.29.") // WSL
      ) {
        return net.address;
      }
    }
  }

  return "localhost";
}

const ip = getLocalIP();

console.log(`IP détectée : ${ip}`);

// =========================
// apps/native/.env
// =========================
const nativeEnv = `# Auto-généré par set-ip.js
EXPO_PUBLIC_SERVER_URL=http://${ip}:3001
`;

writeFileSync("apps/native/.env", nativeEnv);

console.log("✅ apps/native/.env mis à jour");

// =========================
// apps/web/.env
// =========================
const corsOrigins = [
  `http://${ip}:3001`,
  `http://${ip}:8081`,
  "http://localhost:3001",
  "http://localhost:8081",
].join(",");

const webEnv = `BETTER_AUTH_SECRET=etihbDoDbmmxzb96cdn99ZbZHEMBX6jb
BETTER_AUTH_URL=http://${ip}:3001
CORS_ORIGIN=${corsOrigins}
DATABASE_URL=postgresql://postgres:password@localhost:5432/my-better-t-app
`;

writeFileSync("apps/web/.env", webEnv);

console.log("✅ apps/web/.env mis à jour");

// =========================
// docker-compose.yml
// =========================
let docker = readFileSync("docker-compose.yml", "utf8");

docker = docker.replace(
  /- BETTER_AUTH_URL=.*/g,
  `- BETTER_AUTH_URL=http://${ip}:3001`
);

docker = docker.replace(
  /- CORS_ORIGIN=.*/g,
  `- CORS_ORIGIN=${corsOrigins}`
);

writeFileSync("docker-compose.yml", docker);

console.log("✅ docker-compose.yml mis à jour");

console.log(`\n🚀 Tout est configuré pour http://${ip}:3001`);