import Image, { type ImageProps } from "next/image";

// User-provided external links load directly in the browser. Uploaded images
// have already been optimized by the R2 upload pipeline.
export default function ContentImage(props: ImageProps) {
  const external = typeof props.src === "string" && /^https?:\/\//i.test(props.src);
  return <Image {...props} alt={props.alt} unoptimized={external || props.unoptimized} />;
}
