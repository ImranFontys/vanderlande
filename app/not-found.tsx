import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page px-4 py-12 flex flex-col items-center gap-4 text-center">
      <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-muted shadow-sm">
        404 · Niet gevonden
      </div>
      <h1 className="text-3xl font-semibold text-slate-900">Pagina niet gevonden</h1>
      <p className="text-muted max-w-xl">
        De opgevraagde pagina bestaat niet of is verplaatst. Ga terug naar de passagiersweergave of open het operator dashboard.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="primary-btn px-5">
          Naar passagiers
        </Link>
        <Link href="/operator" className="ghost-btn px-5">
          Naar operator
        </Link>
      </div>
    </main>
  );
}
