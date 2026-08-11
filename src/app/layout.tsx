import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotebookProvider } from "@/contexts/NotebookContext";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "NxZenAI",
  description: "Learn AI. Build AI. Become Industry Ready.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <NotebookProvider>{children}</NotebookProvider>
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
