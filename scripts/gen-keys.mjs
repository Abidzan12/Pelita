import { randomBytes } from "node:crypto";

const keys = {
  DATA_ENCRYPTION_KEY: randomBytes(32).toString("base64"),
  TICKET_PEPPER: randomBytes(32).toString("base64"),
  SESSION_SECRET: randomBytes(32).toString("base64"),
};

console.log("Salin nilai berikut ke file .env (jangan commit file .env):\n");
for (const [name, value] of Object.entries(keys)) {
  console.log(`${name}=${value}`);
}
console.log(
  "\nSimpan salinan kunci di tempat aman. Jika DATA_ENCRYPTION_KEY hilang, data terenkripsi tidak dapat dibuka.",
);
