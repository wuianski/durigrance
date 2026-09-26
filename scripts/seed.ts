/**
 * Seeds the database with 100 users (numbers 001-100, each with a random
 * unguessable token) and generates one QR code PNG per user.
 *
 * Idempotent: existing rows (and their tokens) are kept, so already-printed
 * QR codes stay valid. Rerun with a different QR_BASE_URL only before
 * printing; after stickers exist, never change QR_BASE_URL:
 *
 *   QR_BASE_URL=https://your-stable-host.example npm run seed
 *
 * Printed codes always point at QR_BASE_URL/q/<token>. After you buy a
 * domain, set APP_URL to that domain — keep QR_BASE_URL online so scans
 * still land here and get redirected.
 */
import fs from "node:fs";
import path from "node:path";
import { customAlphabet } from "nanoid";
import QRCode from "qrcode";
import { db } from "../lib/db";

const TOTAL_USERS = 100;
const QR_BASE_URL = (
  process.env.QR_BASE_URL ??
  process.env.BASE_URL ??
  "http://localhost:3000"
).replace(/\/+$/, "");

// No lookalike characters (0/O, 1/l/I), 16 chars => not guessable.
const generateToken = customAlphabet(
  "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz",
  16
);

async function main() {
  const insert = db.prepare(
    "INSERT INTO users (user_number, token) VALUES (?, ?)"
  );
  const exists = db.prepare("SELECT 1 FROM users WHERE user_number = ?");

  let created = 0;
  for (let i = 1; i <= TOTAL_USERS; i++) {
    const userNumber = String(i).padStart(3, "0");
    if (exists.get(userNumber)) continue;
    insert.run(userNumber, generateToken());
    created++;
  }

  const users = db
    .prepare("SELECT user_number, token FROM users ORDER BY user_number")
    .all() as { user_number: string; token: string }[];

  const qrDir = path.join(process.cwd(), "qrcodes");
  fs.mkdirSync(qrDir, { recursive: true });

  const csvLines = ["user_number,token,qr_url,destination"];
  for (const user of users) {
    const qrUrl = `${QR_BASE_URL}/q/${user.token}`;
    const destination = `${QR_BASE_URL}/u/${user.token}`;
    csvLines.push(`${user.user_number},${user.token},${qrUrl},${destination}`);
    await QRCode.toFile(path.join(qrDir, `${user.user_number}.png`), qrUrl, {
      width: 512,
      margin: 2,
    });
  }
  fs.writeFileSync(path.join(qrDir, "tokens.csv"), csvLines.join("\n") + "\n");

  console.log(
    `Seed complete: ${created} new users created, ${users.length} total.`
  );
  console.log(`QR codes written to qrcodes/ (QR_BASE_URL: ${QR_BASE_URL})`);
  console.log(`Reference list: qrcodes/tokens.csv`);
}

main();
