export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="rounded-[1.5rem] border border-red-100 bg-white p-8 text-center shadow-xl shadow-red-950/5">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-red-600">
          Audit could not start
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          Let&apos;s try that again.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">{message}</p>
        <button
          onClick={onRetry}
          className="mt-7 rounded-full bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          Back to form
        </button>
      </div>
    </section>
  );
}
