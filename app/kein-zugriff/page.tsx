import Image from "next/image";

export const metadata = { title: "Kein Zugriff · P8" };

export default function NoAccess() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <Image src="/p8-logo.svg" alt="P8" width={44} height={44} className="mx-auto" />
        <h1 className="mt-5 text-lg font-semibold">Kein Zugriff</h1>
        <p className="mt-2 text-sm text-muted">
          Dieses Dashboard ist nur über deinen persönlichen Zugangslink erreichbar. Öffne den Link aus unserer E-Mail noch einmal
          oder frag bei P8 nach einem neuen.
        </p>
      </div>
    </main>
  );
}
