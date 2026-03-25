import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js with Tailwind CSS",
  description: "A Next.js project configured with Tailwind CSS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
