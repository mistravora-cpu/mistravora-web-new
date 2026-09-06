# Admin password change

Open **Dashboard → Settings → Change password**. Enter the current password and a matching new password of 12–128 characters. The form clears after success; the new password is used on the next sign-in.

The server action independently checks authenticated admin membership, validates the inputs and calls Supabase `auth.updateUser` through the current user's session with both `password` and `current_password`. It uses no service-role override and cannot select another account. Passwords are not saved to CMS settings, logged, or returned in action results. This uses Supabase's documented [current-password verification](https://supabase.com/docs/guides/auth/passwords#verifying-the-current-password). Supabase's configured password requirements and authentication limits also apply.

Expired sessions or a required recent sign-in produce instructions to sign out and sign back in before retrying. Password reset for someone who cannot sign in is a separate flow.

Validation: lint, all 15 unit tests and a production webpack build passed. Password-action tests use mocked authentication to verify authorization, input rejection, current-password forwarding, provider failures and safe error messages. No real user's password was changed during verification. No database migration or new environment variable is required.
