import { getCalculatorConfig } from "@/lib/calculator-settings";
import { SettingsEditor } from "../settings/settings-editor";
import Link from "next/link";
export default async function CalculatorAdminPage() {
 const config = await getCalculatorConfig();
 return <div className="space-y-6"><h1 className="text-2xl font-bold">Cost calculator configuration</h1><p>Edit project types, feature costs, timeline multipliers and the illustrative LKR-per-USD conversion rate. Prices must be nonnegative; IDs must be unique within each list.</p><SettingsEditor groups={[{label:"Public calculator",fields:[{key:"pricing_calculator_config",label:"Configuration (JSON)",type:"textarea"}]}]} initialData={{pricing_calculator_config:JSON.stringify(config,null,2)}} /><Link href="/tools/cost-calculator" className="underline">View cost calculator</Link><p>The ROI calculator uses amounts and assumptions entered by the visitor; these are projections, not promised results.</p></div>;
}
