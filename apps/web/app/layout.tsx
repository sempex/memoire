import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "./components/trpc-provider";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "./components/navbar";
import { PublicEnvScript } from "next-runtime-env";
import { env } from "next-runtime-env";

export const NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = env(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "memoire",
  description:
    "Upload, share, and safeguard your important files with just a few clicks. Your digital memories, secured forever.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <PublicEnvScript />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Navbar />
          <TRPCProvider>{children}</TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
