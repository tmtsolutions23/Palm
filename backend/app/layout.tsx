import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Palm Reader — AI palm readings, daily insights, and compatibility",
  description:
    "Palm Reader turns a palm photo into an entertaining AI reading, ongoing daily insights, and compatibility reports.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
