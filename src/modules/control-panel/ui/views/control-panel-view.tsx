"use client";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight, PackageOpen, Wallet } from "lucide-react";

export function ControlPanelView() {
  const trpc = useTRPC();

  const { data: wallets } = useSuspenseQuery(
    trpc.wallets.getWallets.queryOptions(),
  );

  const { data: buckets } = useSuspenseQuery(
    trpc.buckets.getBuckets.queryOptions(),
  );

  const totalBalance = wallets.reduce(
    (sum, wallet) => sum + parseFloat(wallet.balance),
    0,
  );

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Control panel</h1>
      <p className="mb-8 text-secondary-4">An overview of your life</p>

      <div className="flex flex-col gap-8">
        <div className="rounded-lg bg-gradient-to-br from-secondary-4 via-primary-1 to-primary-2 p-[1px]">
          <div className="rounded-lg bg-secondary-1/90 p-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="mb-2 text-sm font-medium text-secondary-4">
                  Current worth
                </p>

                <p className="mb-1 bg-gradient-to-r from-primary-1 to-primary-2 bg-clip-text text-5xl font-bold text-transparent">
                  {totalBalance.toFixed(2)} €
                </p>

                <div className="flex items-center gap-2 text-sm text-primary-1">
                  <ArrowUpRight className="h-4 w-4" />

                  <span>
                    Across {wallets.length} wallet
                    {wallets.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-primary-1/30 p-4">
                <Wallet className="h-8 w-8 text-primary-1" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-secondary-4">
            <Wallet className="h-5 w-5 text-primary-1" />
            Your wallets
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wallets.map((wallet, index) => {
              const balance = parseFloat(wallet.balance);
              const percentage =
                totalBalance > 0 ? (balance / totalBalance) * 100 : 0;

              return (
                <div
                  key={wallet.id}
                  className="rounded-lg border border-secondary-3/50 bg-gradient-to-br from-secondary-2/50 to-secondary-1/50 p-6"
                >
                  <div className="mb-4 flex items-end justify-between">
                    <div>
                      <h3 className="mb-1 truncate text-lg font-semibold text-white">
                        {wallet.name}
                      </h3>

                      <p className="text-2xl font-bold text-primary-1">
                        {balance.toFixed(2)} €
                      </p>
                    </div>

                    <p className="text-xs font-medium text-secondary-4">
                      {percentage.toFixed(1)}% of total
                    </p>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-secondary-1">
                    <div
                      className="h-1.5 rounded-full bg-primary-1"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-secondary-4">
            <PackageOpen className="h-5 w-5 text-primary-1" />
            Your buckets
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {buckets.map((bucket, index) => {
              const balance = parseFloat(bucket.balance);

              return (
                <div
                  key={bucket.id}
                  className="rounded-lg border border-secondary-3/50 bg-gradient-to-br from-secondary-2/50 to-secondary-1/50 p-6"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <div
                      className={cn("flex size-2 rounded-full bg-primary-1", {
                        "bg-yellow-500": balance <= 50,
                        "bg-red-500": balance <= 0,
                      })}
                    />

                    <h3 className="truncate text-lg font-semibold text-white">
                      {bucket.name}
                    </h3>
                  </div>

                  <p className="text-2xl font-bold text-primary-1">
                    {balance.toFixed(2)} €
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
