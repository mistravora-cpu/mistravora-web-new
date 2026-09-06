"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(1024),
  newPassword: z.string().min(12).max(128),
  confirmPassword: z.string().min(12).max(128),
}).refine((value) => value.newPassword === value.confirmPassword, {
  message: "The new passwords do not match.",
}).refine((value) => value.currentPassword !== value.newPassword, {
  message: "Choose a different password from your current password.",
});

export async function changePassword(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  try {
    const admin = await requireAdmin();
    if (!admin) return { error: "Please sign in with an administrator account." };

    const parsed = passwordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (!parsed.success) {
      return { error: "Enter your current password and matching new passwords of 12–128 characters. The new password must be different." };
    }

    const supabase = await createClient();
    // Use the authenticated user's session, never a service-role/admin override.
    // Supabase verifies current_password before accepting the change.
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
      current_password: parsed.data.currentPassword,
    });
    if (error) {
      switch (error.code) {
        case "current_password_mismatch":
        case "invalid_credentials":
          return { error: "Your current password is incorrect." };
        case "weak_password":
          return { error: "Choose a stronger password. Use a long, unique passphrase with uppercase and lowercase letters, numbers and symbols." };
        case "same_password":
          return { error: "Choose a different password from your current password." };
        case "reauthentication_needed":
        case "reauthentication_not_valid":
        case "session_not_found":
        case "session_expired":
          return { error: "Please sign out and sign in again, then retry changing your password." };
        case "over_request_rate_limit":
        case "over_email_send_rate_limit":
          return { error: "Too many attempts. Please wait a few minutes and try again." };
        default:
          return { error: "The password could not be changed. Please try again or sign in again." };
      }
    }
    return { success: true };
  } catch {
    // Never return/log credentials or raw authentication-provider responses.
    return { error: "The password could not be changed. Please try again." };
  }
}
