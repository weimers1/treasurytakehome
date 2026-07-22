"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  data: any;
  isEditable?: boolean;
}

export default function ResultCard({ data, isEditable = false }: ResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle data mapping (handles both nested and flat structures)
  const labelInfo = data.labelInfo || {
    brand_name: data.brand_name,
    abv: data.abv,
    class_type: data.class_type,
    sulfite_declaration: data.sulfite_declaration,
    net_contents: data.net_contents,
  };

  const compliance = data.compliance || {
    isValid: data.isValid,
    checks: data.checks,
    score: data.score,
  };

  const timestamp = data.timestamp;
  const isValid = compliance?.isValid;
  const score = compliance?.score;

  // Formatting helper for various timestamp types
  const formatTimestamp = (ts: any) => {
    if (!ts) return "Recently scanned";
    
    // If it's an ISO string
    if (typeof ts === "string") {
      try {
        return new Date(ts).toLocaleString();
      } catch (e) {
        return ts;
      }
    }

    // If it's a Firestore-style timestamp object {seconds, nanoseconds}
    if (ts && typeof ts === "object" && "seconds" in ts) {
      try {
        return new Date(ts.seconds * 1000).toLocaleString();
      } catch (e) {
        return "Unknown date";
      }
    }

    return "Recently scanned";
  };

  return (
    <div className={cn(
      "overflow-hidden rounded-xl border bg-white shadow-sm transition-all dark:bg-zinc-900",
      isValid ? "border-green-200 dark:border-green-900/30" : "border-red-200 dark:border-red-900/30"
    )}>
      {/* Header Summary */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {isValid ? (
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          ) : (
            <AlertCircle className="h-6 w-6 text-red-500" />
          )}
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {labelInfo?.brand_name || "Unknown Brand"}
            </h3>
            <p className="text-xs text-zinc-500">
              {formatTimestamp(timestamp)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Score: {Math.round(score ?? 0)}%
            </div>
            <div className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              isValid ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              {isValid ? "Compliant" : "Non-Compliant"}
            </div>
          </div>
          {isExpanded ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-zinc-100 p-4 space-y-4 dark:border-zinc-800">
          {/* TTB Data Section */}
          <div>
            <h4 className="flex items-center gap-1.5 mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <Info className="h-3 w-3" />
              Extracted Label Data
            </h4>
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
              <div className="space-y-1">
                <span className="block text-[10px] font-medium text-zinc-400 uppercase">Brand</span>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">{labelInfo?.brand_name || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-medium text-zinc-400 uppercase">ABV</span>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">{labelInfo?.abv || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-medium text-zinc-400 uppercase">Class/Type</span>
                <p className="text-sm text-zinc-800 dark:text-zinc-200 truncate" title={labelInfo?.class_type}>{labelInfo?.class_type || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-medium text-zinc-400 uppercase">Sulfites</span>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">{labelInfo?.sulfite_declaration ? "Declared" : "Not Found"}</p>
              </div>
            </div>
          </div>

          {/* Compliance Checks Section */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Compliance Results</h4>
            <div className="space-y-2">
              {compliance?.checks?.map((check: any, idx: number) => {
                const status = check.status?.toUpperCase();
                const isPass = status === "PASS";
                const isWarning = status === "WARNING";
                
                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3",
                      isPass 
                        ? "bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/20" 
                        : isWarning
                        ? "bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20"
                        : "bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20"
                    )}
                  >
                    {isPass ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    ) : isWarning ? (
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{check.rule}</p>
                      <p className="text-xs text-zinc-500 leading-relaxed">{check.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
