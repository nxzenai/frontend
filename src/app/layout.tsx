import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotebookProvider } from "@/contexts/NotebookContext";
import { Toaster } from "react-hot-toast";

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
      <body className="font-sans">
        <AuthProvider>
          <NotebookProvider>{children}</NotebookProvider>
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
