import { fmtEur } from "@/lib/format";
import type { DateRange } from "@/lib/types";
import { Funnel, type FunnelInput } from "./Funnel";
import { SourceTag, rangeText } from "./ui";

export function Hero({ data, budget, range, mock }: { data: FunnelInput; budget: number | null; range: DateRange; mock: boolean }) {
  return (
    <section className="rounded-2xl border border-line bg-white px-6 py-6 lg:px-8 lg:py-7">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <p className="text-[15px] text-ink-soft">
          <span className="tabular font-display text-2xl font-semibold text-ink">{fmtEur(data.spend)}</span>{" "}
          ausgegeben vom {rangeText(range)}
          {budget != null && <span className="text-muted">, Tagesbudget {fmtEur(budget)}</span>}
        </p>
        <SourceTag mock={mock} />
      </div>
      <Funnel data={data} />
    </section>
  );
}
