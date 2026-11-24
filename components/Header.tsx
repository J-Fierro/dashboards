import Link from "next/link";

export function Header({ title, back }: { title: string; back?: { href: string; label: string } }) {
  return (
    <header className="bg-p8-navy text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-5">
        <span className="rounded-md bg-p8-magenta px-2 py-1 text-sm font-bold tracking-wide">P8</span>
        <div className="min-w-0">
          {back && (
            <Link href={back.href} className="text-xs text-white/60 hover:text-white">
              ← {back.label}
            </Link>
          )}
          <h1 className="truncate text-xl font-semibold">{title}</h1>
        </div>
      </div>
    </header>
  );
}
