import Image, { type ImageProps } from "next/image";
import { isOptimizedImageHost } from "@/lib/image-hosts";
// Uploaded R2 assets and allow-listed hosts get responsive cached derivatives
// from our own domain. Other external URLs remain direct, so no forced
// re-upload is required.
export default function ContentImage(props: ImageProps) {
  const external = typeof props.src === "string" && /^https?:\/\//i.test(props.src);
  const optimized = external && isOptimizedImageHost(String(props.src));
  return <Image {...props} alt={props.alt} unoptimized={props.unoptimized || (external && !optimized)} />;
}
