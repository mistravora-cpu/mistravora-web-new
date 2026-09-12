import Image from "./content-image";
import { publicImageUrl } from "@/lib/content-preview";
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
  return (
    <div className="team-portrait">
      <Image
        src={photo}
        alt={`${name}, ${role} at ${company}`}
        width={864}
        height={1080}
        quality={85}
        sizes={
          profile
            ? "(min-width: 1024px) 432px, (min-width: 768px) 38vw, min(calc(100vw - 32px), 432px)"
            : "(min-width: 1600px) min(calc(25vw - 40px), 432px), (min-width: 768px) min(calc(50vw - 48px), 432px), min(calc(100vw - 32px), 432px)"
        }
        loading={profile ? "eager" : "lazy"}
        className="team-portrait-image aspect-[4/5] h-full w-full object-contain object-bottom"
      />
    </div>
  );
}
