"use client";
import { createContext, useContext, type ReactNode } from "react";
import { businessDefaults, type BusinessProfile } from "@/lib/business-profile-data";
const BusinessContext = createContext<BusinessProfile>(businessDefaults);
export function BusinessProfileProvider({ profile, children }: { profile: BusinessProfile; children: ReactNode }) {
  return <BusinessContext.Provider value={profile}>{children}</BusinessContext.Provider>;
}
export function useBusinessProfile() { return useContext(BusinessContext); }
