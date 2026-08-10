import type { Metadata } from "next";
import { AppNav } from "@/components/app-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "GymOps Product Decision Lab", template: "%s | GymOps Lab" },
  description: "An independent synthetic product-management work sample for evidence-bound vertical software decisions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to main content</a>
        <AppNav />
        <main id="main">{children}</main>
        <footer className="site-footer">
          <p><strong>Independent synthetic work sample.</strong> No employer data, product representation, affiliation, or external mutation.</p>
          <p>Claim ceiling: <code>SOTA_CANDIDATE</code> · Release remains human-owned.</p>
        </footer>
      </body>
    </html>
  );
}
