import Link from "next/link";
import { clients } from "@/config/clients";
import { Header } from "@/components/Header";
import { Panel } from "@/components/ui";

// Internal index of client dashboards. Hide this once client access links exist.
export default function Home() {
  return (
    <>
      <Header subtitle="P8 · Alle Kunden" />
      <main className="mx-auto max-w-[1440px] px-6 py-6 lg:px-10">
        <Panel title="Kunden" subtitle={`${clients.length} Dashboards`}>
          <ul className="border-t border-line">
            {clients.map((c) => (
              <li key={c.slug} className="border-b border-line last:border-0">
                <Link href={`/${c.slug}`} className="flex items-center justify-between px-5 py-4 hover:bg-page/50">
                  <span className="font-semibold">{c.name}</span>
                  <span className="text-sm text-muted">
                    {c.groups.length} {c.groups.length === 1 ? "Kampagne" : "Kampagnen"} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </main>
    </>
  );
}
