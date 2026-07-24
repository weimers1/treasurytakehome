import React from "react";
import { RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BatchProgressProps {
  current: number;
  total: number;
  isProcessing: boolean;
  errors: { name: string; reason: string }[];
}

export default function BatchProgress({ current, total, isProcessing, errors }: BatchProgressProps) {
  if (total === 0) return null;

  const isComplete = !isProcessing && current === total;
  const hasErrors = errors.length > 0;
  const progressPercentage = Math.round((current / total) * 100);

  if (isComplete) {
    if (hasErrors) {
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold">Batch Complete with Issues</h3>
          </div>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-500">
            {total - errors.length} of {total} images processed successfully.
          </p>
          <ul className="mt-3 space-y-2 border-t border-amber-200 pt-3 dark:border-amber-800">
            {errors.map((err, idx) => (
              <li key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed text-amber-700 dark:text-amber-500">
                <span className="font-bold underline shrink-0 max-w-[120px] truncate">{err.name}:</span>
                <span>{err.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
        <CheckCircle2 className="h-6 w-6 text-green-500" />
        <div>
          <h3 className="font-semibold text-green-800 dark:text-green-400">All images processed!</h3>
          <p className="text-sm text-green-700 dark:text-green-500">Successfully scanned {total} labels.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500">
        <div className="flex items-center gap-2">
          {isProcessing && <RefreshCw className="h-3 w-3 animate-spin" />}
          <span>
            {isProcessing 
              ? `Processing label ${Math.min(current + 1, total)} of ${total}...`
              : "Preparing batch..."
            }
          </span>
        </div>
        <span>{progressPercentage}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div 
          className="h-full bg-zinc-900 transition-all duration-500 dark:bg-zinc-100" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
