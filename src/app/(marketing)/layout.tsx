import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./marketing.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-marketing", display: "swap" });

export const metadata: Metadata = {
  title: { default: "NxZenAI — Applied AI Ecosystem", template: "%s | NxZenAI" },
  description: "Learn AI, build with AI, and deploy practical intelligence with NxZenAI Studio, training, solutions, and enterprise consulting.",
  icons: {
    icon: [{ url: "/nxzenai-icon.png", type: "image/png" }],
    shortcut: "/nxzenai-icon.png",
    apple: "/nxzenai-icon.png",
  },
  openGraph: { title: "NxZenAI — Applied AI Ecosystem", description: "One ecosystem for AI Studio, practical training, enterprise solutions, and consulting.", type: "website" },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`marketing-site ${inter.variable}`}>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
