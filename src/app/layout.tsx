import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import IconTroney from "./_components/icons/IconTroney";

export const metadata: Metadata = {
  title: "Troney",
  description: "Expense tracker app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="bg-secondary-1">
        <TRPCReactProvider>
          <main className="flex min-h-screen items-center justify-center">
            <div className="flex w-96 flex-col gap-8 rounded-xl bg-secondary-2 p-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center gap-2 text-2xl font-semibold text-white">
                  <IconTroney />
                  <h1>Troney</h1>
                </div>

                <span className="text-center font-medium text-secondary-4">
                  Track your expenses with ease
                </span>
              </div>

              {children}
            </div>
          </main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
