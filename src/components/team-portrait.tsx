import Image from "next/image";
import { publicImageUrl } from "@/lib/content-preview";
import { PortraitMotion } from "./portrait-motion";
const r2Base = process.env.R2_PUBLIC_URL;
export function TeamPortrait({
  src,
  name,
  role,
  company,
  profile = false,
}: {
  src: string;
  name: string;
  role: string;
  company: string;
  profile?: boolean;
}) {
  const photo = publicImageUrl(src);
  if (!photo) return null;
  // R2 is our configured host; responsive derivatives avoid downloading the
  // original portrait at every screen size. Pasted external links stay direct.
  const hosted =
    !!r2Base &&
    new URL(photo, "https://mistravora.com").origin === new URL(r2Base).origin;
  return (
    <PortraitMotion>
      <Image
        src={photo}
        alt={`${name}, ${role} at ${company}`}
        width={640}
        height={800}
        sizes={
          profile
            ? "(min-width: 1024px) 384px, (min-width: 768px) 40vw, min(calc(100vw - 32px), 416px)"
            : "(min-width: 1920px) 25vw, (min-width: 768px) min(calc(50vw - 64px), 480px), min(calc(100vw - 32px), 480px)"
        }
        unoptimized={!hosted}
        loading={profile ? "eager" : "lazy"}
        className="aspect-[4/5] h-full w-full object-contain object-bottom"
      />
    </PortraitMotion>
  );
}
