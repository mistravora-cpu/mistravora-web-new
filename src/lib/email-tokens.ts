import { createHmac, timingSafeEqual } from "node:crypto";
function secret() {
  const key = process.env.EMAIL_TOKEN_SECRET;
  if (!key || key.length < 32)
    throw new Error("EMAIL_TOKEN_SECRET must be at least 32 characters");
  return key;
}
export function unsubscribeToken(subscriberId: string) {
  const signature = createHmac("sha256", secret())
    .update(`unsubscribe:${subscriberId}`)
    .digest("hex");
  return `${subscriberId}.${signature}`;
}
export function verifyUnsubscribeToken(token: string): string | null {
  const [id, signature, extra] = token.split(".");
  if (
    extra ||
    !/^[0-9a-f-]{36}$/i.test(id ?? "") ||
    !/^[0-9a-f]{64}$/.test(signature ?? "")
  )
    return null;
  const expected = unsubscribeToken(id).split(".")[1];
  return timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex"),
  )
    ? id
    : null;
}
