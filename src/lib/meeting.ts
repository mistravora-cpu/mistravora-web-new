export const meetingTimes = ["Morning (9:00 am – 12:00 pm)", "Afternoon (12:00 pm – 3:00 pm)", "Late afternoon (3:00 pm – 6:00 pm)"] as const;
export const meetingFormats = ["Video call (Google Meet / Zoom)", "Phone call", "In person (Sri Lanka)"] as const;

export type MeetingState =
  | { ok: true; date?: string; time?: string; format?: string }
  | { ok: false; error: string }
  | null;

/** Custom DOM event used by any "Book a meeting" button to open the dialog. */
export const OPEN_MEETING_EVENT = "mistravora:book-meeting";

export function openMeetingDialog() {
  window.dispatchEvent(new Event(OPEN_MEETING_EVENT));
}
