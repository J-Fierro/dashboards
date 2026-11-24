// Prints the hash to paste into config/clients.ts as passwordHash.
// Usage: npm run hash-password -- "the password"
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run hash-password -- "the password"');
  process.exit(1);
}
const salt = randomBytes(16);
const key = scryptSync(password, salt, 32);
console.log(`scrypt$${salt.toString("hex")}$${key.toString("hex")}`);
