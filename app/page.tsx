import Link from "next/link";
import { clients } from "@/config/clients";
import { Header } from "@/components/Header";
import { Panel } from "@/components/ui";

// Internal index of client dashboards. Hide this once client access links exist.
export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1320px] px-6 py-8 lg:px-10">
        <Panel title="Kunden">
          <ul className="border-t border-line">
            {clients.map((c) => (
              <li key={c.slug} className="border-b border-line last:border-0">
                <Link href={`/${c.slug}`} className="flex items-center justify-between px-6 py-4 hover:bg-page/60">
                  <span className="font-semibold">{c.name}</span>
                  <span className="text-sm text-muted">
                    {c.groups.length} {c.groups.length === 1 ? "Kampagne" : "Kampagnen"}
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
