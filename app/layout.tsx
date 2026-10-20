import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from '../components/Navbar'
import LineasFondo from '../components/LineasFondo'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Drivana",
  description: "Renta de autos",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
   <body
  className="min-h-full flex flex-col"
  style={{ background: 'linear-gradient(to top, #3b0764 0%, #000000 70%) fixed, #000000' }}
>
  <LineasFondo />
  <Navbar />
  {children}
</body>
    </html>
  );
}