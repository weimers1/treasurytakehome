"use client";

import React, { useEffect, useState } from "react";
import { getScanHistory } from "@/lib/services/db";
import ResultCard from "@/components/ResultCard";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadHistory = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await getScanHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <button
          onClick={() => loadHistory(true)}
          disabled={isLoading || isRefreshing}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50 active:scale-95 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
          <RefreshCw className="h-8 w-8 animate-spin mb-4" />
          <p>Loading your history...</p>
        </div>
      ) : history.length > 0 ? (
        <div className="grid gap-4">
          {history.map((scan) => (
            <ResultCard key={scan.id} data={scan} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 text-center text-zinc-500">
          No scan history yet. Start scanning to see your results here!
        </div>
      )}
    </div>
  );
}
