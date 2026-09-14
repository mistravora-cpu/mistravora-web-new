import { permanentRedirect } from "next/navigation";
import { estimatePath } from "@/lib/quote-links";

export default function CostCalculatorPage() {
  permanentRedirect(estimatePath);
}
