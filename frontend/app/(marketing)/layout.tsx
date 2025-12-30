import React from "react";
import ClientLayoutWrapper_landing from "@/components/helper/ClientLayoutWrapper_landing";

export default function MarketingLayout({children,}: { children: React.ReactNode; }) {
  return (
      <ClientLayoutWrapper_landing>
          {children}
      </ClientLayoutWrapper_landing>
  );
}