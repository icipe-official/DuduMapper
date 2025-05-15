"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import NavbarContainer from "@/components/shared/navbarContainer";
import { AuthProvider } from "@/context/context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const inter = Inter({ subsets: ["latin"] });

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Dudu Mapper</title>
        <meta name="description" content="Vector Atlas 3.0" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <NavbarContainer />
          <QueryClientProvider client={queryClient}>
            {children}
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          </QueryClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
