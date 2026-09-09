import Image from "next/image";
import { publicImageUrl } from "@/lib/content-preview";
const r2Base=process.env.R2_PUBLIC_URL;
export function TeamPortrait({src,name,role,company,profile=false}:{src:string;name:string;role:string;company:string;profile?:boolean}) {
  const photo=publicImageUrl(src);if(!photo)return null;
  // R2 is our configured host; responsive derivatives avoid downloading the
  // original portrait at every screen size. Pasted external links stay direct.
  const hosted=!!r2Base && new URL(photo,"https://mistravora.com").origin === new URL(r2Base).origin;
  return <Image src={photo} alt={`${name}, ${role} at ${company}`} width={640} height={800}
    sizes={profile?"(max-width: 768px) min(100vw - 32px, 384px), 320px":"(max-width: 640px) min(100vw - 32px, 384px), (max-width: 1024px) 45vw, 384px"}
    unoptimized={!hosted} loading={profile?"eager":"lazy"}
    className="aspect-[4/5] h-full w-full object-cover object-top motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.025] motion-safe:group-focus-within:scale-[1.025]" />;
}
