import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
