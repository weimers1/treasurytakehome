"use client";

import React, { useState, useRef } from "react";
import { Camera, Upload, X, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ResultCard from "@/components/ResultCard";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB input limit
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [scanResult, setScanResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Handle File Selection
  const handleFileSelection = (selectedFile: File) => {
    setError(null);
    setUploadStatus("idle");
    setScanResult(null);

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError("Invalid file type. Please upload a JPEG, PNG, or WebP image.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelection(selectedFile);
    }
  };

  // Clear Selection
  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setUploadStatus("idle");
    setScanResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (nativeCameraInputRef.current) nativeCameraInputRef.current.value = "";
  };

  // Compressed Upload Handler
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("idle");
    setError(null);

    try {
      // 1. Instant client-side compression (~50ms)
      console.log(`Original file size: ${(file.size / 1024).toFixed(1)} KB`);
      const compressedFile = await compressImageClient(file, 1024, 0.8);
      console.log(`Compressed file size: ${(compressedFile.size / 1024).toFixed(1)} KB`);

      // 2. Dispatch lightweight payload to server
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

      console.log("Scan complete:", result);
      setScanResult(result.results);
      setUploadStatus("success");
    } catch (err: any) {
      console.error("Upload failed:", err);
      setUploadStatus("error");
      setError(err.message || "Failed to scan label. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        
        {/* Selected Preview */}
        {preview ? (
          <div className="absolute inset-0 z-10 bg-zinc-100 dark:bg-zinc-800">
            <img src={preview} alt="Preview" className="h-full w-full object-contain" />
            <button
              onClick={clearSelection}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/80 text-white hover:bg-zinc-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          /* Empty State / Upload Options */
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="grid w-full max-w-md grid-cols-2 gap-4">
              <button
                onClick={() => nativeCameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 transition-all hover:bg-zinc-50 active:scale-95 dark:bg-zinc-800 dark:ring-zinc-700 dark:hover:bg-zinc-700"
              >
                <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-900">
                  <Camera className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                </div>
                <span className="text-sm font-semibold">Take Photo</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 transition-all hover:bg-zinc-50 active:scale-95 dark:bg-zinc-800 dark:ring-zinc-700 dark:hover:bg-zinc-700"
              >
                <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-900">
                  <Upload className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                </div>
                <span className="text-sm font-semibold">Choose File</span>
              </button>
            </div>
            <p className="mt-6 text-xs text-zinc-500">
              Supports JPEG, PNG, and WebP up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* Hidden Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={onFileInputChange}
      />
      <input
        type="file"
        ref={nativeCameraInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={onFileInputChange}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {uploadStatus === "success" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <p>Label scanned successfully!</p>
          </div>

          {/* Detailed Result Card */}
          {scanResult && (
            <ResultCard data={scanResult} />
          )}
        </div>
      )}

      {preview && uploadStatus !== "success" && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200",
            isUploading && "cursor-not-allowed"
          )}
        >
          {isUploading ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            "Scan Label"
          )}
        </button>
      )}
    </div>
  );
}