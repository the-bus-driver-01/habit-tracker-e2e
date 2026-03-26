import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next.js Layout App",
  description: "A Next.js application with main layout and navigation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-1 flex">
            <Navigation />
            <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}