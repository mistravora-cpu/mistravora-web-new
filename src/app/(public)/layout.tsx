import { getBusinessProfile } from "@/lib/business-profile";
import { BusinessProfileProvider } from "@/components/business-profile-provider";
import { RevealObserver } from "@/components/reveal-observer";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ChatWidget } from "@/components/chat-widget-lazy";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getBusinessProfile();
  return (
    <BusinessProfileProvider profile={profile}>
      <RevealObserver />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-background focus:p-3">Skip to content</a>
      <SiteHeader />
      <div id="main-content" tabIndex={-1} className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
      {profile.chatEnabled !== "false" && <ChatWidget />}
    </BusinessProfileProvider>
  );
}
