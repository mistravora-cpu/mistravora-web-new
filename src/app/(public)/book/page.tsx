import { applySeoOverrides } from "@/lib/seo-overrides";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import { ContentShell } from "@/components/content-page";
import { pageMetadata } from "@/lib/seo";
import { BookingForm, type Slot } from "./booking-form";
export const dynamic = "force-dynamic";
const baseMetadata = pageMetadata("Book a consultation", "Choose an available time to discuss your software project with Mistravora.", "/book");
async function availableSlots() {
  const after = new Date(); after.setHours(after.getHours() + 1);
  return createPublicClient().from("booking_slots").select("id, starts_at, ends_at").eq("available", true).gt("starts_at", after.toISOString()).order("starts_at").limit(40).abortSignal(AbortSignal.timeout(4000));
}
export default async function BookPage() {
  const { data } = await availableSlots();
  return <ContentShell title="Book a consultation" description="Discuss your project, ask questions, and plan the next step.">{data?.length ? <BookingForm slots={data as Slot[]} /> : <p className="mt-8 text-muted-foreground">No appointments are currently listed. <Link href="/contact" className="text-primary underline">Contact us to arrange a time</Link>.</p>}</ContentShell>;
}

export async function generateMetadata() { return applySeoOverrides(baseMetadata); }
