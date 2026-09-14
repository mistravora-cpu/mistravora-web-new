import { getFaqs } from "@/lib/services";
import { Faq } from "@/components/faq";

export async function PageFaqs({
  path,
  inset = false,
}: {
  path: string;
  inset?: boolean;
}) {
  const page = path === "/" ? "home" : path.replace(/^\//, "");
  const rows = (await getFaqs(undefined, true)).filter(
    (row) =>
      row.page.replace(/^\//, "") === page ||
      (["home", "contact"].includes(page) && row.page === "general"),
  );
  if (!rows.length) return null;
  return (
    <section
      aria-labelledby="page-faqs-heading"
      className={`w-full section-py ${inset ? "" : "site-gutter"}`}
    >
      <h2
        id="page-faqs-heading"
        className="mb-8 text-2xl font-bold tracking-tight sm:text-3xl"
      >
        Frequently asked questions
      </h2>
      <Faq items={rows.map((row) => ({ q: row.question, a: row.answer }))} />
    </section>
  );
}
