"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Info, AlertTriangle, Edit2, Check, X, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  data: any;
  isEditable?: boolean;
}

export default function ResultCard({ data, isEditable = false }: ResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for frontend editing
  const [localLabelInfo, setLocalLabelInfo] = useState<any>({});
  const [localCompliance, setLocalCompliance] = useState<any>({});
  const [originalStatuses, setOriginalStatuses] = useState<string[]>([]);

  // Initialize local state from props
  useEffect(() => {
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

    setLocalLabelInfo(labelInfo);
    setLocalCompliance(compliance);

    // Store original statuses for override comparison
    if (compliance.checks) {
      setOriginalStatuses(compliance.checks.map((c: any) => c.status.toUpperCase()));
    }
  }, [data]);

  const timestamp = data.timestamp;
  const isValid = localCompliance?.isValid;
  const score = localCompliance?.score;

  // Formatting helper for various timestamp types
  const formatTimestamp = (ts: any) => {
    if (!ts) return "Recently scanned";
    if (typeof ts === "string") {
      try { return new Date(ts).toLocaleString(); } catch (e) { return ts; }
    }
    if (ts && typeof ts === "object" && "seconds" in ts) {
      try { return new Date(ts.seconds * 1000).toLocaleString(); } catch (e) { return "Unknown date"; }
    }
    return "Recently scanned";
  };

  const handleToggleCheck = (idx: number) => {
    if (!isEditing) return;
    
    const newChecks = [...localCompliance.checks];
    const currentStatus = newChecks[idx].status.toUpperCase();
    
    // Toggle logic: PASS -> FAIL -> WARNING -> PASS
    if (currentStatus === "PASS") newChecks[idx].status = "FAIL";
    else if (currentStatus === "FAIL") newChecks[idx].status = "WARNING";
    else newChecks[idx].status = "PASS";

    const newScore = (newChecks.filter((c: any) => c.status.toUpperCase() === "PASS").length / newChecks.length) * 100;
    const newIsValid = newChecks.every((c: any) => c.status.toUpperCase() !== "FAIL");

    setLocalCompliance({
      ...localCompliance,
      checks: newChecks,
      score: newScore,
      isValid: newIsValid
    });
  };

  return (
    <div className={cn(
      "overflow-hidden rounded-xl border bg-white shadow-sm transition-all dark:bg-zinc-900",
      isValid ? "border-green-200 dark:border-green-900/30" : "border-red-200 dark:border-red-900/30",
      isEditing && "ring-2 ring-blue-500 border-transparent"
    )}>
      {/* Header Summary */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setIsExpanded(!isExpanded)}>
          {isValid ? (
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          ) : (
            <AlertCircle className="h-6 w-6 text-red-500" />
          )}
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {localLabelInfo?.brand_name || "Unknown Brand"}
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
          
          {isEditable && (
            <button 
              onClick={() => {
                setIsEditing(!isEditing);
                if (!isExpanded) setIsExpanded(true);
              }}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isEditing ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
              )}
            >
              {isEditing ? <Check className="h-5 w-5" /> : <Edit2 className="h-4 w-4" />}
            </button>
          )}
          
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1">
            {isExpanded ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-zinc-100 p-4 space-y-4 dark:border-zinc-800">
          {/* TTB Data Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <Info className="h-3 w-3" />
                Extracted Label Data
              </h4>
              {isEditing && <span className="text-[12px] font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded dark:bg-blue-900/20">Editing Mode</span>}
            </div>
            
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
              <div className="space-y-1">
                <span className="block text-[10px] font-medium text-zinc-400 uppercase">Brand</span>
                {isEditing ? (
                  <input 
                    className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                    value={localLabelInfo.brand_name || ""}
                    onChange={(e) => setLocalLabelInfo({...localLabelInfo, brand_name: e.target.value})}
                  />
                ) : (
                  <p className="text-sm text-zinc-800 dark:text-zinc-200">{localLabelInfo?.brand_name || "N/A"}</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-medium text-zinc-400 uppercase">ABV</span>
                {isEditing ? (
                  <input 
                    className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                    value={localLabelInfo.abv || ""}
                    onChange={(e) => setLocalLabelInfo({...localLabelInfo, abv: e.target.value})}
                  />
                ) : (
                  <p className="text-sm text-zinc-800 dark:text-zinc-200">{localLabelInfo?.abv || "N/A"}</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-medium text-zinc-400 uppercase">Class/Type</span>
                {isEditing ? (
                  <input 
                    className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                    value={localLabelInfo.class_type || ""}
                    onChange={(e) => setLocalLabelInfo({...localLabelInfo, class_type: e.target.value})}
                  />
                ) : (
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 truncate" title={localLabelInfo?.class_type}>{localLabelInfo?.class_type || "N/A"}</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-medium text-zinc-400 uppercase">Sulfites</span>
                {isEditing ? (
                  <button 
                    onClick={() => setLocalLabelInfo({...localLabelInfo, sulfite_declaration: !localLabelInfo.sulfite_declaration})}
                    className={cn(
                      "text-xs px-2 py-1 rounded border transition-colors",
                      localLabelInfo.sulfite_declaration ? "bg-green-100 border-green-200 text-green-700" : "bg-zinc-100 border-zinc-200 text-zinc-600"
                    )}
                  >
                    {localLabelInfo.sulfite_declaration ? "Declared" : "Not Found"}
                  </button>
                ) : (
                  <p className="text-sm text-zinc-800 dark:text-zinc-200">{localLabelInfo?.sulfite_declaration ? "Declared" : "Not Found"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Compliance Checks Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Compliance Results</h4>
              {isEditing && <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full dark:bg-blue-900/40">Click status icon to swap result</span>}
            </div>
            
            <div className="space-y-2">
              {localCompliance?.checks?.map((check: any, idx: number) => {
                const status = check.status?.toUpperCase();
                const isPass = status === "PASS";
                const isWarning = status === "WARNING";
                const isOverridden = status !== originalStatuses[idx];
                
                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 transition-all",
                      isEditing && "hover:border-blue-400 hover:shadow-md cursor-pointer active:scale-[0.99]",
                      isPass 
                        ? "bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/20" 
                        : isWarning
                        ? "bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20"
                        : "bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20"
                    )}
                    onClick={() => handleToggleCheck(idx)}
                  >
                    <div className="mt-0.5">
                      {isPass ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : isWarning ? (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{check.rule}</p>
                        {isEditing && (
                          <div className="flex items-center gap-1.5">
                            {isOverridden && (
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 dark:bg-blue-900/30 dark:border-blue-800">
                                Manual Override
                              </span>
                            )}
                            <Repeat className="h-3 w-3 text-blue-400" />
                          </div>
                        )}
                      </div>
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
