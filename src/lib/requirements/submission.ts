import { z } from "zod";
import { requestSchema } from "./schema";
export const submissionSchema = z
  .object({
    id: z.string().uuid(),
    configVersion: z.string().max(40),
    requirements: requestSchema,
    contact: z.object({
      name: z.string().trim().min(2).max(100),
      email: z.email().max(200),
      company: z.string().trim().max(150).default(""),
      phone: z.string().trim().max(30).default(""),
      whatsapp: z.string().trim().max(30).default(""),
      preferred: z.enum(["Email", "Phone", "WhatsApp"]),
      website: z.string().trim().max(500).default(""),
    }),
    consent: z.literal(true),
  })
  .superRefine((value, ctx) => {
    const { contact } = value;
    if (contact.preferred === "Phone" && !contact.phone)
      ctx.addIssue({
        code: "custom",
        message: "Enter a phone number for your preferred contact method.",
      });
    if (contact.preferred === "WhatsApp" && !contact.whatsapp)
      ctx.addIssue({
        code: "custom",
        message: "Enter a WhatsApp number for your preferred contact method.",
      });
    for (const key of ["phone", "whatsapp"] as const)
      if (contact[key] && !/^[+\d\s().-]{5,30}$/.test(contact[key]))
        ctx.addIssue({
          code: "custom",
          message: "Use a valid phone or WhatsApp number.",
        });
    if (contact.website) {
      try {
        const url = new URL(contact.website);
        if (
          !["http:", "https:"].includes(url.protocol) ||
          url.username ||
          url.password
        )
          throw Error();
      } catch {
        ctx.addIssue({ code: "custom", message: "Use a public website URL." });
      }
    }
  });
export type Submission = z.infer<typeof submissionSchema>;
