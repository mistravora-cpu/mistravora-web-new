import type { Metadata } from "next";
import Link from "next/link";
import { getAdminContactInfo as getContactInfo, getAdminSocialMedia as getSocialMedia, getAdminFaqs as getFaqs } from "@/lib/services";
import { CrudManager, type ColumnDef, type FieldDef } from "../crud-manager";

export const metadata: Metadata = {
  title: "Contact Management",
  robots: { index: false, follow: false },
};

const contactColumns: ColumnDef[] = [
  { name: "headline", label: "Headline" },
  { name: "email", label: "Email" },
  { name: "phone", label: "Phone" },
];

const contactFields: FieldDef[] = [
  { name: "headline", label: "Headline", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "address", label: "Address" },
  { name: "email", label: "Email" },
  { name: "phone", label: "Phone" },
  { name: "whatsapp", label: "WhatsApp" },
];

const socialColumns: ColumnDef[] = [
  { name: "platform", label: "Platform" },
  { name: "url", label: "URL" },
  { name: "published", label: "Active" },
];

const socialFields: FieldDef[] = [
  { name: "platform", label: "Platform", required: true, placeholder: "LinkedIn / GitHub / etc." },
  { name: "url", label: "URL", required: true, placeholder: "https://..." },
  { name: "icon", label: "Icon", type: "icon" },
  { name: "sort_order", label: "Sort Order", type: "number" },
  { name: "published", label: "Active", type: "boolean" },
];

const faqColumns: ColumnDef[] = [
  { name: "question", label: "Question" },
  { name: "published", label: "Active" },
];

const faqFields: FieldDef[] = [
  { name: "page", label: "Page", required: true, placeholder: "contact" },
  { name: "question", label: "Question", required: true },
  { name: "answer", label: "Answer", type: "textarea", required: true },
  { name: "sort_order", label: "Sort Order", type: "number" },
  { name: "published", label: "Active", type: "boolean" },
];

export default async function ContactAdminPage() {
  const [contactInfo, socialMedia, faqs] = await Promise.all([
    getContactInfo(),
    getSocialMedia(),
    getFaqs("contact"),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Contact Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage contact page content and settings. For customer inquiries, visit the{" "}
          <Link href="/dashboard/inquiries" className="text-primary hover:underline">
            Inquiries
          </Link>{" "}
          page.
        </p>
      </div>

      <CrudManager
        table="contact_info"
        title="Contact Information"
        columns={contactColumns}
        fields={contactFields}
        rows={contactInfo ? [contactInfo as unknown as Record<string, unknown>] : []}
      />

      <CrudManager
        table="social_media"
        title="Social Media"
        columns={socialColumns}
        fields={socialFields}
        rows={socialMedia as unknown as Record<string, unknown>[]}
      />

      <CrudManager
        table="faqs"
        title="FAQs"
        columns={faqColumns}
        fields={faqFields}
        rows={faqs as unknown as Record<string, unknown>[]}
        filterColumn="page"
        filterValue="contact"
      />
    </div>
  );
}
