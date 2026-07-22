export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">History</h1>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-300">
        <p className="font-medium mb-1">Note on eventual consistency:</p>
        <p>
          To ensure the fastest possible scanning experience, we process and store results asynchronously. 
          New scans might take a few moments to appear in your history. If a result doesn't show up after a minute, 
          please reach out to us.
        </p>
      </div>

      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        View your past scans and saved labels.
      </p>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 text-center text-zinc-500">
        No scan history yet. Start scanning to see your results here!
      </div>
    </div>
  );
}
