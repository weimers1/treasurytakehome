import Scanner from "@/components/Scanner";

export default function ScanPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Scan Label</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Upload or take a photo of an alcohol label to get started.
        </p>
      </div>
      
      <Scanner />
    </div>
  );
}
