import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { DateRange } from "@/lib/types";
import { timeVienna } from "@/lib/format";
import { DateRangePicker } from "./DateRangePicker";
import { RefreshButton } from "./RefreshButton";

export function Header({ client, range, rangeLocked }: { client?: { name: string; slug: string }; range?: DateRange; rangeLocked?: boolean }) {
  return (
    <header className="bg-ink text-white">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-10">
        <div className="flex items-center gap-3.5">
          <Image src="/p8-logo-white.svg" alt="P8" width={36} height={36} priority />
          <div className="leading-tight">
            {client ? (
              <Link href={`/${client.slug}`} className="font-display text-lg font-semibold tracking-tight hover:text-white/80">
                {client.name}
              </Link>
            ) : (
              <p className="font-display text-lg font-semibold tracking-tight">P8 Dashboards</p>
            )}
            <p className="text-xs text-white/50">Performance Dashboard</p>
          </div>
        </div>
        {range && (
          <div className="flex items-center gap-2.5">
            <span className="tabular hidden text-xs text-white/40 sm:inline" title="Zuletzt geladen">
              Stand {timeVienna()}
            </span>
            <Suspense>
              <DateRangePicker range={range} locked={rangeLocked} />
            </Suspense>
            <RefreshButton />
          </div>
        )}
      </div>
    </header>
  );
}
