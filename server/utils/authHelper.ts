import crypto from "crypto";

const SECRET = process.env.GEMINI_API_KEY || "flipkart_secret_key_123!@#";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function generateToken(userId: string): string {
  const payloadObj = {
    userId,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days expiration
  };
  const payloadStr = JSON.stringify(payloadObj);
  const base64Payload = Buffer.from(payloadStr).toString("base64");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(base64Payload)
    .digest("hex");

  return `${base64Payload}.${signature}`;
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [base64Payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(base64Payload)
      .digest("hex");

    if (signature !== expectedSignature) {
      return null;
    }

    const payloadStr = Buffer.from(base64Payload, "base64").toString("utf-8");
    const payload = JSON.parse(payloadStr);

    if (Date.now() > payload.exp) {
      return null; // Token expired
    }

    return { userId: payload.userId };
  } catch (err) {
    return null;
  }
}
