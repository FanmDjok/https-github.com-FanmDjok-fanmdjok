import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Chiffrement des jetons des réseaux sociaux avant stockage en base
// (AES-256-GCM). ENCRYPTION_KEY doit être une clé de 32 octets encodée en
// base64 (voir .env.example : openssl rand -base64 32).
const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error("ENCRYPTION_KEY n'est pas configurée.");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY doit être une clé de 32 octets encodée en base64.");
  }
  return key;
}

// Format stocké : <iv base64>.<authTag base64>.<ciphertext base64>
export function encryptToken(plainText: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${authTag.toString("base64")}.${ciphertext.toString("base64")}`;
}

export function decryptToken(payload: string): string {
  const key = getKey();
  const [ivB64, authTagB64, ciphertextB64] = payload.split(".");
  if (!ivB64 || !authTagB64 || !ciphertextB64) {
    throw new Error("Jeton chiffré invalide.");
  }
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
  const plainText = Buffer.concat([
    decipher.update(Buffer.from(ciphertextB64, "base64")),
    decipher.final(),
  ]);
  return plainText.toString("utf8");
}
