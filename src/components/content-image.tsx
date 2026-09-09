import Image, { type ImageProps } from "next/image";
const r2Base = process.env.R2_PUBLIC_URL;
// Uploaded R2 assets get responsive cached derivatives. Arbitrary external
// URLs remain direct: no new proxy allowlist or forced re-upload is required.
export default function ContentImage(props: ImageProps) {
  const external = typeof props.src === "string" && /^https?:\/\//i.test(props.src);
  let hosted = false;
  if (external && r2Base) {
    try { hosted = new URL(String(props.src)).origin === new URL(r2Base).origin; } catch {}
  }
  return <Image {...props} alt={props.alt} unoptimized={props.unoptimized || (external && !hosted)} />;
}
