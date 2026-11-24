import Link from "next/link";
import { clients } from "@/config/clients";
import { Header } from "@/components/Header";

// Internal index of client dashboards. Hide this once client access links exist.
export default function Home() {
  return (
    <>
      <Header title="Kunden-Dashboards" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/${c.slug}`}
                className="block rounded-xl border border-p8-navy/10 bg-white p-5 shadow-sm transition hover:border-p8-magenta/40 hover:shadow"
              >
                <p className="text-lg font-semibold">{c.name}</p>
                <p className="mt-1 text-sm text-p8-navy/60">
                  {c.groups.length} {c.groups.length === 1 ? "Kampagne" : "Kampagnen"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
