import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import BootstrapClient from "@/components/BootstrapClient";

export const metadata: Metadata = {
  title: "Radio Streaming Platform",
  description: "Management platform for radio streaming services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
        <BootstrapClient />
      </body>
    </html>
  );
}
