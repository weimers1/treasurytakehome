"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, X, RefreshCw, CheckCircle2, AlertCircle, Layers, Image as ImageIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import ResultCard from "@/components/ResultCard";
import BatchProgress from "@/components/BatchProgress";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB input limit
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BATCH_LIMIT = 10;

interface StagedFile {
  file: File;
  preview: string;
  id: string;
}

/**
 * Utility: Compresses and resizes images in browser memory using HTML Canvas
 */
async function compressImageClient(
  file: File,
  maxWidth = 1024,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Maintain aspect ratio while bounding within maxWidth
        if (width > height && width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else if (height > maxWidth) {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file); // Fallback to raw file if canvas context unavailable
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function Scanner() {
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [stagingQueue, setStagingQueue] = useState<StagedFile[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [batchErrors, setBatchErrors] = useState<{ name: string; reason: string }[]>([]);
  const [currentlyEditingId, setCurrentlyEditingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Clean up ObjectURLs on unmount
  useEffect(() => {
    const currentQueue = stagingQueue;
    return () => {
      currentQueue.forEach(item => URL.revokeObjectURL(item.preview));
    };
  }, []);

  // Handle File Selection
  const handleFileSelection = (files: FileList | null) => {
    if (!files) return;
    
    // Clear previous scan state when new files are selected
    setError(null);
    setBatchErrors([]);
    setProgress({ current: 0, total: 0 });

    const newFiles = Array.from(files);
    const validFiles: StagedFile[] = [];
    let limitReached = false;

    for (const selectedFile of newFiles) {
      if (stagingQueue.length + validFiles.length >= BATCH_LIMIT) {
        limitReached = true;
        break;
      }

      if (!ALLOWED_TYPES.includes(selectedFile.type)) {
        setError("Invalid file type. Please upload JPEG, PNG, or WebP.");
        continue;
      }

      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("File too large (max 10MB).");
        continue;
      }

      validFiles.push({
        file: selectedFile,
        preview: URL.createObjectURL(selectedFile),
        id: Math.random().toString(36).substring(7)
      });
    }

    if (limitReached) {
      setError(`Limited to ${BATCH_LIMIT} images per batch.`);
    }

    if (isBulkMode) {
      setStagingQueue(prev => [...prev, ...validFiles]);
    } else {
      // In single mode, replace everything
      stagingQueue.forEach(item => URL.revokeObjectURL(item.preview));
      setStagingQueue(validFiles.slice(0, 1));
      setResults([]); // Clear results in single mode when replacing
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (nativeCameraInputRef.current) nativeCameraInputRef.current.value = "";
  };

  const removeFromQueue = (id: string) => {
    setStagingQueue(prev => {
      const item = prev.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const clearAll = () => {
    stagingQueue.forEach(item => URL.revokeObjectURL(item.preview));
    setStagingQueue([]);
    setResults([]);
    setBatchErrors([]);
    setError(null);
    setIsProcessing(false);
    setProgress({ current: 0, total: 0 });
  };

  const handleScan = async () => {
    if (stagingQueue.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: stagingQueue.length });
    setError(null);
    setBatchErrors([]);

    // If starting fresh in single mode, clear old result
    if (!isBulkMode) setResults([]);

    const currentBatch = [...stagingQueue];

    for (let i = 0; i < currentBatch.length; i++) {
      const item = currentBatch[i];

      try {
        const compressedFile = await compressImageClient(item.file, 1024, 0.8);
        const formData = new FormData();
        formData.append("label", compressedFile);

        const response = await fetch("/api/scan", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Processing failed");
        }

        const newResult = {
          ...result.results,
          id: result.scanId,
          timestamp: new Date().toISOString()
        };

        // Append to top
        setResults(prev => [newResult, ...prev]);

      } catch (err: any) {
        console.error("Scan failed for item:", err);
        setBatchErrors(prev => [...prev, { name: item.file.name, reason: err.message || "Unknown error" }]);
        const errorResult = {
          id: `error-${Math.random()}`,
          brand_name: "Error Processing Label",
          timestamp: new Date().toISOString(),
          isValid: false,
          score: 0,
          compliance: {
            isValid: false,
            checks: [{ rule: "System Error", details: err.message || "Failed to process this image.", status: "FAIL" }]
          }
        };
        setResults(prev => [errorResult, ...prev]);
      } finally {
        // Increment progress ONLY after completion (receipt)
        setProgress(prev => ({ ...prev, current: i + 1 }));
      }

      // Throttle between requests (1.2s delay)
      if (i < currentBatch.length - 1) {
        await new Promise(r => setTimeout(r, 1200));
      }
    }

    setIsProcessing(false);
    // Clear staging queue after success
    stagingQueue.forEach(item => URL.revokeObjectURL(item.preview));
    setStagingQueue([]);
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 pb-20">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
        <button
          onClick={() => { setIsBulkMode(false); clearAll(); }}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all",
            !isBulkMode ? "bg-white shadow-sm dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          <Camera className="h-4 w-4" />
          Single Scan
        </button>
        <button
          onClick={() => { setIsBulkMode(true); clearAll(); }}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all",
            isBulkMode ? "bg-white shadow-sm dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          <Layers className="h-4 w-4" />
          Bulk Scan
        </button>
      </div>

      {/* Upload / Staging Area */}
      <div className={cn(
        "relative w-full overflow-hidden rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50",
        stagingQueue.length > 0 ? "p-4" : "aspect-video flex items-center justify-center"
      )}>

        {stagingQueue.length > 0 ? (
          <div className="space-y-4">
            {isBulkMode ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {stagingQueue.map((item) => (
                  <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
                    <img src={item.preview} alt="Staged" className="h-full w-full object-cover" />
                    <button
                      onClick={() => removeFromQueue(item.id)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-all hover:bg-red-600 active:scale-95"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {stagingQueue.length < BATCH_LIMIT && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-zinc-300 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
                  >
                    <Plus className="h-6 w-6 text-zinc-400" />
                    <span className="text-[10px] font-medium text-zinc-500 uppercase">Add More</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
                  <img src={stagingQueue[0].preview} alt="Staged" className="h-full w-full object-contain" />
                  <button
                    onClick={() => removeFromQueue(stagingQueue[0].id)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:bg-red-600 active:scale-95"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
              {isBulkMode ? (
                <span className="text-xs font-medium text-zinc-500">
                  {stagingQueue.length} / {BATCH_LIMIT} images staged
                </span>
              ) : <div />}
              <button onClick={clearAll} className="text-xs font-semibold text-red-500 hover:text-red-600">
                Clear All
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="grid w-full max-md gap-4" style={{ gridTemplateColumns: isBulkMode ? '1fr' : '1fr 1fr' }}>
              {!isBulkMode && (
                <button
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 transition-all hover:bg-zinc-50 active:scale-95 dark:bg-zinc-800 dark:ring-zinc-700 dark:hover:bg-zinc-700"
                >
                  <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-900">
                    <Camera className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <span className="text-sm font-semibold">Take Photo</span>
                </button>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 transition-all hover:bg-zinc-50 active:scale-95 dark:bg-zinc-800 dark:ring-zinc-700 dark:hover:bg-zinc-700"
              >
                <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-900">
                  <Upload className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                </div>
                <span className="text-sm font-semibold">{isBulkMode ? "Upload Batch" : "Choose File"}</span>
              </button>
            </div>
            <p className="mt-6 text-xs text-zinc-500">
              Supports JPEG, PNG, and WebP up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* Progress Indicator Component */}
      <BatchProgress 
        current={progress.current} 
        total={progress.total} 
        isProcessing={isProcessing} 
        errors={batchErrors} 
      />

      {/* Hidden Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple={isBulkMode}
        onChange={(e) => handleFileSelection(e.target.files)}
      />
      <input
        type="file"
        ref={nativeCameraInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelection(e.target.files)}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Scan Button */}
      {stagingQueue.length > 0 && !isProcessing && (
        <button
          onClick={handleScan}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
        >
          Scan {stagingQueue.length} Label{stagingQueue.length > 1 ? "s" : ""}
        </button>
      )}

      {/* Results Feed */}
      {results.length > 0 && (
        <div className="space-y-6 pt-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-2 dark:border-zinc-800">
            <ImageIcon className="h-4 w-4 text-zinc-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Scan Results</h2>
          </div>
          <div className="space-y-4">
            {results.map((result) => (
              <ResultCard 
                key={result.id} 
                data={result} 
                isEditable={true} 
                activeEditingId={currentlyEditingId}
                onEditingChange={(isEditing) => {
                  if (isEditing) setCurrentlyEditingId(result.id);
                  else if (currentlyEditingId === result.id) setCurrentlyEditingId(null);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}