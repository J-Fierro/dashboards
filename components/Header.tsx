import Image from "next/image";
import { Suspense } from "react";
import type { DateRange } from "@/lib/types";
import { timeVienna } from "@/lib/format";
import { DateRangePicker } from "./DateRangePicker";
import { RefreshButton } from "./RefreshButton";

export function Header({ subtitle, range, rangeLocked }: { subtitle: string; range?: DateRange; rangeLocked?: boolean }) {
  return (
    <header className="bg-ink text-white">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-3 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
            <Image src="/p8-logo.svg" alt="P8" width={28} height={28} priority />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-semibold">Performance Dashboard</p>
            <p className="text-xs text-white/55">{subtitle}</p>
          </div>
        </div>
        {range && (
          <div className="flex items-center gap-3">
            <span className="tabular text-xs text-white/45">{timeVienna()}</span>
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
