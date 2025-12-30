import React from "react";
import ClientLayoutWrapper_board from "@/components/helper/ClientLayoutWrapper_board";

export default function DashboardLayout({children,}: { children: React.ReactNode; }) {
  return (
      <ClientLayoutWrapper_board>
          {children}
      </ClientLayoutWrapper_board>
  );
}