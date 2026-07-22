import { NextResponse } from "next/server";
import { performOCR } from "@/lib/services/ocr";
import { runRules } from "@/lib/services/rules";
import { saveScanResults } from "@/lib/services/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("label") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64 for OCR service
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageBase64 = buffer.toString("base64");


    // 1. Perform OCR
    const extractedData = await performOCR(imageBase64, file.type);

    // 2. Run Rules Engine
    const complianceResults = await runRules(extractedData);

    // 3. Save to Database (Asynchronous/Non-blocking)
    const scanId = crypto.randomUUID();
    
    // We don't await this to keep the response fast
    saveScanResults({
      id: scanId,
      ...extractedData,
      ...complianceResults,
      timestamp: new Date().toISOString(),
    }).catch(err => console.error("Async DB Save Error:", err));

    return NextResponse.json({
      success: true,
      message: "Processing complete",
      scanId: scanId,
      results: {
        labelInfo: extractedData,
        compliance: complianceResults
      }
    });

  } catch (error: any) {
    console.error("Dispatcher Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Internal Server Error" 
    }, { status: 500 });
  }
}
