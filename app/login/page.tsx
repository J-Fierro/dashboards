import Image from "next/image";
import { getClient } from "@/config/clients";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Anmelden · P8 Performance Dashboard" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/" } = await searchParams;
  const client = getClient(next.split("/")[1] ?? "");

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3">
          <Image src="/p8-logo.svg" alt="P8" width={36} height={36} />
          <div className="leading-tight">
            <p className="text-[15px] font-semibold">Performance Dashboard</p>
            <p className="text-xs text-muted">{client ? client.name : "P8"}</p>
          </div>
        </div>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
