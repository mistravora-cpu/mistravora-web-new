import { z } from "zod";
export const defaultQuoteRecipients = [
  "mistravora@gmail.com",
  "info@mistravora.com",
];
export const quoteRecipientsSchema = z
  .array(z.email().trim().toLowerCase().max(200))
  .min(1)
  .max(5)
  .transform((emails) => [...new Set(emails)]);
