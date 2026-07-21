export default function ScanPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Scan Label</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        Upload or take a photo of an alcohol label to get started.
      </p>
      {/* Scanner implementation will go here */}
      <div className="flex aspect-video w-full max-w-2xl items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
        <p className="text-zinc-500">Camera preview placeholder</p>
      </div>
    </div>
  );
}
