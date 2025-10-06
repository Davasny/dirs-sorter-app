import { Roboto } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";
import { Providers } from "@/components/app-providers";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} antialiased md:h-screen`}>
        <Providers>
          <main className="h-full">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
