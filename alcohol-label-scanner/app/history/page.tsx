export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">History</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        View your past scans and saved labels.
      </p>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 text-center text-zinc-500">
        No scan history yet. Start scanning to see your results here!
      </div>
    </div>
  );
}
