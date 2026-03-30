import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "William Vance's Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          overflowX: "hidden",
          overflowY: "scroll",
        }}
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
