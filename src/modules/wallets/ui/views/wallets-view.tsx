"use client";

import { Suspense } from "react";
import { WalletsTable } from "../sections/wallets-table";
import { Spinner } from "@/components/ui/spinner/spinner";
// import { ErrorBoundary } from "react-error-boundary";

export function WalletsView() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Wallets</h1>
      <p className="mb-8 text-secondary-4">Manage where your money goes</p>

      {/*<ErrorBoundary fallback={<div>Something went wrong</div>}>*/}
      <Suspense fallback={<Spinner message="Loading your wallets" />}>
        <WalletsTable />
      </Suspense>
      {/*</ErrorBoundary>*/}
    </div>
  );
}
