"use client";
export function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="min-h-11 text-left text-sm hover:text-primary"
      onClick={() =>
        window.dispatchEvent(new Event("mistravora:cookie-settings"))
      }
    >
      Cookie preferences
    </button>
  );
}
